import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma, tenantTx } from '../../config/database';
import { AppError, NotFoundError, ValidationError, ConflictError } from '../../utils/errors';
import { PLATFORM_DOMAIN, isReservedSubdomain } from '../../config/tenant';
import { invalidateTenantCache } from '../../middleware/tenant.middleware';
import { clearFeatureCache } from '../../middleware/featureGate';
import { clearSubscriptionCache } from '../../middleware/subscription.middleware';

const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const VALID_SUBSCRIPTION_STATUSES = new Set(['active', 'trial', 'suspended', 'cancelled', 'expired']);

export interface CreateInstitutionInput {
  name: string;
  code?: string;
  subdomain: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface AssignSubscriptionInput {
  planId: string;
  billingCycle?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  autoRenew?: boolean;
}

class InstitutionAdminService {
  async list() {
    return prisma.institution.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, students: true } },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { plan: { select: { id: true, name: true, code: true } } },
        },
      },
    });
  }

  async create(input: CreateInstitutionInput) {
    const subdomain = (input.subdomain || '').trim().toLowerCase();
    const name = (input.name || '').trim();
    if (!name) throw new ValidationError('Institution name is required');
    if (!SUBDOMAIN_RE.test(subdomain)) {
      throw new ValidationError('Subdomain must be a valid DNS label (lowercase a-z, 0-9, hyphens)');
    }
    if (subdomain === 'deverp' || isReservedSubdomain(subdomain)) {
      throw new ValidationError(`Subdomain "${subdomain}" is reserved`);
    }

    const emailDomain = `${subdomain}.${PLATFORM_DOMAIN}`;
    const code = (input.code || subdomain).replace(/\s+/g, '').toUpperCase();

    const existing = await prisma.institution.findFirst({
      where: { OR: [{ subdomain }, { emailDomain }, { code }] },
    });
    if (existing) {
      if (existing.subdomain === subdomain || existing.emailDomain === emailDomain) {
        throw new ConflictError(`Subdomain "${subdomain}" is already in use`);
      }
      throw new ConflictError(`Code "${code}" is already in use`);
    }

    const initialPassword = crypto.randomBytes(9).toString('base64url') + 'Aa7!';
    const initialEmail = `admin@${emailDomain}`;

    try {
      const institution = await tenantTx(async (tx) => {
        const created = await tx.institution.create({
          data: {
            name,
            code,
            subdomain,
            emailDomain,
            type: input.type === 'SCHOOL' ? 'SCHOOL' : 'COLLEGE',
            address: input.address || null,
            city: input.city || null,
            state: input.state || null,
            country: input.country || 'India',
            pincode: input.pincode || null,
            phone: input.phone || null,
            email: input.email || null,
            website: input.website || null,
          },
        });
        await tx.user.create({
          data: {
            institutionId: created.id,
            email: initialEmail,
            password: await bcrypt.hash(initialPassword, 12),
            role: 'CHIEF_HEAD',
            firstName: 'Admin',
            lastName: created.name,
            fullName: `${created.name} Admin`,
            isActive: true,
            isEmailVerified: true,
          },
        });
        return created;
      });

      return {
        institution,
        initialAdmin: { email: initialEmail, password: initialPassword },
        message: 'Institution created. The initial admin credentials are shown only once.',
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Subdomain, code, or email domain already in use');
      }
      throw error;
    }
  }

  async update(id: string, input: Partial<CreateInstitutionInput> & { isActive?: boolean }) {
    await this.requireExists(id);
    if ('subdomain' in input || 'emailDomain' in input) {
      throw new ValidationError('Subdomain and email domain cannot be changed after creation');
    }
    const data: Prisma.InstitutionUpdateInput = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new ValidationError('Institution name cannot be empty');
      data.name = name;
    }
    if (input.type !== undefined) data.type = input.type === 'SCHOOL' ? 'SCHOOL' : 'COLLEGE';
    for (const field of ['address', 'city', 'state', 'country', 'pincode', 'phone', 'email', 'website'] as const) {
      if (input[field] !== undefined) data[field] = (input[field] as string) || null;
    }

    const institution = await prisma.institution.update({ where: { id }, data });
    invalidateTenantCache(id);
    return institution;
  }

  async setStatus(id: string, isActive: boolean) {
    await this.requireExists(id);
    const institution = await prisma.institution.update({
      where: { id },
      data: { isActive },
    });
    invalidateTenantCache(id);
    return institution;
  }

  async getSubscriptions(id: string) {
    await this.requireExists(id);
    return prisma.institutionSubscription.findMany({
      where: { institutionId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        plan: { select: { id: true, name: true, code: true, monthlyPrice: true, annualPrice: true } },
      },
    });
  }

  async assignSubscription(id: string, input: AssignSubscriptionInput) {
    await this.requireExists(id);
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: input.planId } });
    if (!plan || !plan.isActive) throw new ValidationError('Plan not found or inactive');

    const billingCycle = input.billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    if (isNaN(startDate.getTime())) throw new ValidationError('Invalid start date');

    let endDate: Date;
    if (input.endDate) {
      endDate = new Date(input.endDate);
      if (isNaN(endDate.getTime())) throw new ValidationError('Invalid end date');
    } else {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));
    }
    if (endDate.getTime() <= startDate.getTime()) {
      throw new ValidationError('End date must be after start date');
    }

    const amount = billingCycle === 'yearly' ? plan.annualPrice : plan.monthlyPrice;
    const status = input.status === 'trial' ? 'trial' : 'active';

    const subscription = await tenantTx(async (tx) => {
      // Supersede active subscriptions of other plans
      await tx.institutionSubscription.updateMany({
        where: { institutionId: id, status: { in: ['active', 'trial'] }, NOT: { planId: plan.id } },
        data: { status: 'cancelled', autoRenew: false },
      });
      const userCount = await tx.user.count({ where: { institutionId: id } });
      const values = {
        billingCycle,
        startDate,
        endDate,
        status,
        autoRenew: input.autoRenew ?? true,
        userCount,
        amount,
        discount: 0,
        tax: 0,
        totalAmount: amount,
      };
      // One row per (institutionId, planId) — re-assigning a plan renews/updates its row
      const existing = await tx.institutionSubscription.findFirst({
        where: { institutionId: id, planId: plan.id },
      });
      if (existing) {
        return tx.institutionSubscription.update({
          where: { id: existing.id },
          data: values,
          include: { plan: true },
        });
      }
      return tx.institutionSubscription.create({
        data: { institutionId: id, planId: plan.id, ...values },
        include: { plan: true },
      });
    });

    clearFeatureCache(id);
    clearSubscriptionCache(id);
    return subscription;
  }

  async updateSubscription(subscriptionId: string, input: { status?: string; endDate?: string; autoRenew?: boolean }) {
    const subscription = await prisma.institutionSubscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) throw new NotFoundError('Subscription');

    const data: Prisma.InstitutionSubscriptionUpdateInput = {};
    if (input.status !== undefined) {
      if (!VALID_SUBSCRIPTION_STATUSES.has(input.status)) {
        throw new ValidationError('Invalid subscription status');
      }
      data.status = input.status;
    }
    if (input.endDate !== undefined) {
      const endDate = new Date(input.endDate);
      if (isNaN(endDate.getTime())) throw new ValidationError('Invalid end date');
      if (endDate.getTime() <= subscription.startDate.getTime()) {
        throw new ValidationError('End date must be after start date');
      }
      data.endDate = endDate;
    }
    if (input.autoRenew !== undefined) data.autoRenew = input.autoRenew;

    const updated = await prisma.institutionSubscription.update({
      where: { id: subscriptionId },
      data,
      include: { plan: true },
    });
    clearFeatureCache(subscription.institutionId);
    clearSubscriptionCache(subscription.institutionId);
    return updated;
  }

  private async requireExists(id: string) {
    const institution = await prisma.institution.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!institution) throw new NotFoundError('Institution');
    return institution;
  }
}

export const institutionAdminService = new InstitutionAdminService();

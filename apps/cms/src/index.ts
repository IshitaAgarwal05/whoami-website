export default {
  register() {},

  async bootstrap({ strapi }: { strapi: any }) {
    try {
      console.log('🔑 Bootstrapping public API permissions...');
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });
      
      if (publicRole) {
        const actions = [
          'api::product.product.find',
          'api::product.product.findOne',
          'api::product.product.create',
          'api::product.product.update',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::category.category.create',
          'api::collection.collection.find',
          'api::collection.collection.findOne',
          'api::collection.collection.create',
          'api::blog.blog.find',
          'api::blog.blog.findOne',
          'api::blog.blog.create',
          'api::faq.faq.find',
          'api::faq.faq.findOne',
          'api::faq.faq.create',
          'api::testimonial.testimonial.find',
          'api::testimonial.testimonial.findOne',
          'api::testimonial.testimonial.create',
          'api::coupon.coupon.find',
          'api::coupon.coupon.findOne',
          'api::coupon.coupon.create',
          'api::announcement.announcement.find',
          'api::announcement.announcement.findOne',
          'api::announcement.announcement.create',
          'api::career.career.find',
          'api::career.career.findOne',
          'api::career.career.create',
          'api::application.application.create',
          'api::site-configuration.site-configuration.find',
          'api::site-configuration.site-configuration.create',
          'api::homepage.homepage.find',
          'api::homepage.homepage.create',
          'api::navigation.navigation.find',
          'api::navigation.navigation.create',
          'api::footer.footer.find',
          'api::footer.footer.create',
          'api::order.order.find',
          'api::order.order.findOne',
          'api::order.order.create',
          'api::customer.customer.find',
          'api::customer.customer.findOne',
          'api::customer.customer.create',
          'api::review.review.find',
          'api::review.review.findOne',
          'api::review.review.create',
          'api::contact-submission.contact-submission.find',
          'api::contact-submission.contact-submission.findOne',
          'api::contact-submission.contact-submission.create',
          'api::newsletter-subscriber.newsletter-subscriber.find',
          'api::newsletter-subscriber.newsletter-subscriber.findOne',
          'api::newsletter-subscriber.newsletter-subscriber.create',
          'api::audit-log.audit-log.find',
          'api::audit-log.audit-log.findOne',
          'api::audit-log.audit-log.create',
          'api::inventory-transaction.inventory-transaction.find',
          'api::inventory-transaction.inventory-transaction.findOne',
          'api::inventory-transaction.inventory-transaction.create'
        ];

        for (const action of actions) {
          const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: publicRole.id }
          });
          if (!exists) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id
              }
            });
            console.log(`   - Granted public permission: ${action}`);
          }
        }
      }
      console.log('✅ Public permissions bootstrap completed!');
    } catch (err: any) {
      console.error('❌ Failed to bootstrap public permissions:', err.message);
    }
  }
};

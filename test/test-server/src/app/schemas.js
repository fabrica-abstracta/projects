const ActivitySchema = require("./routers/activity/activity.schema");
const ArchiveSchema = require("./routers/archive/archive.schema");
const RecoverySchema = require("./routers/authentication/recover.schema");
const SessionSchema = require("./routers/authentication/session.schema");
const CustomerSchema = require("./routers/company/company.schema");
const ProductSchema = require("./routers/expirations/expiration.schema");
const PaymentSchema = require("./routers/payments/payment.schema");
const ProductSchema = require("./routers/products/product.schema");
const RoleSchema = require("./routers/roles/role.schema");
const SaleSchema = require("./routers/sales/sale.schema");
const SubscriptionSchema = require("./routers/subscription/subscription.schema");
const TicketSchema = require("./routers/tickets/tickets.schema");
const UserSchema = require("./routers/users/user.schema");

module.exports = {
  ActivitySchema,
  ArchiveSchema,
  RecoverySchema,
  SessionSchema,
  CustomerSchema,
  ProductSchema,
  PaymentSchema,
  ProductSchema,
  RoleSchema,
  SaleSchema,
  SubscriptionSchema,
  TicketSchema,
  UserSchema,
};

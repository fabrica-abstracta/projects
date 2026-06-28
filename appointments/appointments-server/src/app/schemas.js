const RoleSchema = require("./identity/authorization/roles/role.schema");
const UserSchema = require("./identity/authorization/users/user.schema");
const PaymentSchema = require("./identity/subscription/payments/payment.schema");
const TicketsSchema = require("./identity/subscription/tickets/tickets.schema");
const ActivitySchema = require("./routers/activity/activity.schema");
const AppointmentSchema = require("./routers/appointments/appointment.schema");
const CustomerSchema = require("./routers/company/company.schema");
const PatientSchema = require("./routers/patients/patient.schema");
const ServiceSchema = require("./routers/services/service.schema");
const HistorySchema = require("./routers/histories/history.schema");

module.exports = {
  RoleSchema,
  UserSchema,
  PaymentSchema,
  TicketsSchema,
  ActivitySchema,
  AppointmentSchema,
  CustomerSchema,
  PatientSchema,
  ServiceSchema,
  HistorySchema,
};

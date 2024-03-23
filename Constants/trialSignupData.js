const randomNumber = Math.floor(Math.random() * 1000) + 1;
const trialUsers = [
  {
    promoId: "novofreedom-fl24-03",
    docsAllowedPerMonth: 1,
    docsGenerated: 0,
    appUserId: "",
    fbAuthUid: "",
    firmId: "fafhafg",
    firstName: "testfirstName",
    lastName: "lalala",
    firm: "bababa",
    telephone: "31344535",
    streetAddress: "434343434",
    city: "the dddd",
    state: "Florida",
    zipCode: "48080",
    barNumber: "florida-trial-user",
    practiceArea: "florida-ng-litigation",
    email: `user${randomNumber}@test.com`,
    isPromotionalMebership: true,
    customerId: "",
    password: `123te${randomNumber}stTest!1`,
    subscriptionId: "",
    subscriptionPlan: "florida spring promo plan",
    subscriptionCreated: "",
    subscriptionPeriodStart: "",
    subscriptionPeriodEnd: "",
  },
];

module.exports = Object.freeze({
  trialUsers: trialUsers,
});

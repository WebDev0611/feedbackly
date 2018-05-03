export const plans = [
  {
    id: "FREE_PLAN",
    order: 1,
    name: "Free plan",
    price: 0,
    description: "",
    respondents: 50,
    features: ["Limited analytics tools"]
  },
  {
    id: "TEAM_PLAN",
    name: "Team plan",
    order: 2,
    price: 20,
    description: "",
    respondents: 250,
    features: [
      "Full analytics tools",
      "PDF/Excel/CSV export",
      "Survey logic tool"
    ]
  },
  {
    id: "GROWTH_PLAN",
    order: 3,
    name: "Growth plan",
    price: 85,
    description: "",
    respondents: 2000,
    features: [
      "Full analytics tools",
      "PDF/Excel/CSV export",
      "Survey logic tool",
      "Survey visual customization",
      "Real-time notifications (sends only to users in organization)",
      "Add company logo to surveys"
    ]
  },
  {
    id: "COMPANY_PLAN",
    order: 4,
    name: "Company plan",
    price: 200,
    description: "",
    respondents: 5000,
    features: [
      "Full analytics tools",
      "PDF/Excel/CSV export",
      "Survey logic tool",
      "Survey visual customization",
      "Real-time notifications (send to any email address)",
      "Add company logo to surveys",
      //"Marketing Database",
      "Feedback Inbox"
    ]
  }
];

export const allPlansInclude = [
  "Unlimited distribution channels",  
  "Unlimited channel types",
  "Unlimited surveys",
  "Advanced feedback analytics"
]
export default {};

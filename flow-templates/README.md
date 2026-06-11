# Experience Cloud Payment Flow Templates
This folder contains flow templates to get you started with building payment flows for Experience Cloud using FinDock. The templates include a multi-screen and single-screen donation flow. These templates are meant to be customized and extended to fit specific use cases and requirements.

## Installation
1. Press the buttons to deploy the repo to the org.
2. Follow [these instructions](https://help.salesforce.com/s/articleView?id=experience.rss_flow_guestuser.htm&type=5) to set up the guest user access for the flows. Do this for One_Screen_Dontation_Flow, Multi_Screen_Donation_Flow and Contact_Assignment flow.
3. Go to the preferred donation Flow (One-screen or Multi-screen) -> Payment Screen -> Payment Method Selection component
   - configure at least some payment methods
4. Go to Payment Screen -> Payment Initation -> Configure Payment Intent Context -> add at least a success Url and failure Url and verify the mapping matches your use case.
6. Activate your flow.
7. Go to the Experience Cloud Administration -> Preferences -> enable "Allow guest users to access public APIs".
8. Add the flow to your Experience Cloud site.

## Deploy
[![Deploy to Salesforce](https://app.jdeploy.cloud/images/flat.svg)](https://app.jdeploy.cloud/github/FinDockLabs/experience-cloud-templates/flow-templates/main)

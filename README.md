# Experience Cloud Templates for FinDock
This repository contains an example implementation of the FinDock for Experience Cloud features. It includes flow templates for a donation flow in both a multi-screen and single-screen variant. The templates are meant to be a starting point to build upon and can be further customized to fit specific use cases.

Additionally the repository includes an example Experience Cloud site that demonstrates how an Experience Cloud site could be set up to serve as a donations page in a non-profit use case. The site includes a donation flow that utilizes the provided flow templates.

# Installation
1. Create a new Experience Cloud site with the "Build your own (LWR)" template and the name "Donation Page".
2. Press the button to deploy the repo to the org.
3. Follow [these instructions](https://help.salesforce.com/s/articleView?id=experience.rss_flow_guestuser.htm&type=5) to set up the guest user access for the flows. Do this for One_Screen_Dontation_Flow, Multi_Screen_Donation_Flow and Contact_Assignment flow.
4. Go to the preferred donation Flow (One-screen or Multi-screen) -> Payment Screen -> Payment Method Selection component -> configure at least some payment methods
5. Go to the Experience Cloud Administration -> Preferences -> enable "Allow guest users to access public APIs".
6. Publish the Experience Cloud

# Deploy to your org
[![Deploy to Salesforce](https://app.jdeploy.cloud/images/flat.svg)](https://app.jdeploy.cloud/github/FinDockLabs/experience-cloud-templates/main)

# 11\_16\_2025 - thoughts on CropSyst and variable consideration

Currently, CropSyst implements a different model than CharAI. CropSyst uses hundreds of equations and parameters to model biomass accumulation, not yield.



CropSyst measures a crop's performance over several years, with daily stepping, aka recalculating and reforecasting the parameter values at each day. CropSyst measure biomass accumulation, which is different from yield.



I think that CropSyst is great from a technical perspective. However, since none of us are trained agronomists, from a computer science perspective, I feel like we should focus on using machine learning to "come up" with some equations, not try and replicate CropSyst but with biochar.



Also, I think crop rotation is a factor to consider in training our models. I currently cannot download a working copy of CropSyst (I don't think anyone in the team can), but there may be other models or literature out there that kind of outline the biggest variables to consider. To add to that, I feel like we have the biggest variables-- moisture, climate, elevation, and slope, primarily,-- but what if we're missing a big variable?


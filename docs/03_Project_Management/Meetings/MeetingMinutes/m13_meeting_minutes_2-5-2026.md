# CharAI – #54 AI for Agriculture  
## Meeting Minutes  

**DATE**  
3:30 – 4:30 PM, 2/5/2026  

---

## MEETING PARTICIPANTS  

### CORE TEAM  
- Joe Baruch  
- Braydyn Proctor  
- Josh Norlin  
- Matthew Murmin  
- Robel Alemayehu  
- Jaycee Johnson  
- Dev Shrestha (late)  

---

## MEETING LOGISTICS  

- **Agenda:** See below  
- **Meeting conducted:** Zoom videoconference  

---

## MEETING SUMMARY  

### Agenda Meeting 13 - 2/5/2026  

#### Member Updates  
All members gave updates on current progress:

- **Joe:** Progress on hosting via Azure continues.  
- **Matt:** Waiting on Braydyn’s parser; continued work on calculator.  
- **Braydyn:** Transitioned GeoTIFF parsing output to pandas DataFrames.  
- **Josh:** No update provided.  

## Funding & Infrastructure

- Azure is an external service, requiring additional approval steps  
- Some services must go through university IT approval  

**Identified required Azure components:**
- Two Azure Container Networks  
- Azure-hosted database for backend containers  

- Formal approval is required for recurring monthly costs  

**Dev requested full documentation of setup:**
- Required services  
- Setup steps  
- Roles of each component  

---

## Repository & Ownership

- Improve project hand-off process:
  - Associate Azure account with a shared email  
  - Ensure easier transfer of ownership and billing  

- All projects currently stored under `github.com/uiedu`  

- Repositories should be transferred directly rather than shared as code dumps  

---

## Frontend & Development Direction

- **Matt:** Currently handling multiple responsibilities across the stack  

- **Joe:**
  - Suggested adding frontend improvements  
  - Focus areas:
    - Value proposition / landing page  
    - Minor authentication issues  
    - Redirect users automatically to maps page  

---

## Frontend Routing / Environment Handling

- Discussed environment-based routing behavior:
  - For production, use deployed routing  
  - For development, fallback to current URL  
- Use `getAPIurl` function for API calls  
- Utilize VITE environment detection to differentiate configs  

---

## ACTION ITEMS

- Document full Azure setup process (services, steps, architecture)  
- Begin IT approval process for Azure usage  
- Improve repo ownership and transfer workflow  
- Implement frontend improvements (landing page, auth fixes, routing)  
- Continue integration of parser -> calculator -> frontend pipeline  
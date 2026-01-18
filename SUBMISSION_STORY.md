# Recycle Buddy - Our Story

## Inspiration

Our inspiration came from a simple, everyday problem. We found ourselves constantly asking each other, "Can this be recycled in Santa Cruz?" Whether it was a paint, a lawn chair, or metal parts, we were never quite sure where it belonged. Santa Cruz has specific recycling guidelines that differ from other cities, and we wanted a quick, reliable way to know exactly what goes where.

We realized that if we were struggling with this, others in our community probably were too. So we decided to build something we truly needed, a practical recycling guide powered by AI that could instantly identify items and tell us exactly where they belong in Santa Cruz.

## What We Learned

### Environmental Impact

Building Recycle Buddy taught us a lot about how recycling affects our carbon footprint. We learned that different materials create CO₂ emissions when they're thrown away wrong, and that making the right recycling choices really does make a difference. It was eye-opening to see how small daily decisions about waste can add up to something big.

We also learned about making more eco-friendly choices in our day-to-day lives. Understanding recycling rates and environmental impact made us think more about what we buy and throw away. The app doesn't just tell you where to put something. It shows you the real impact of your choices, like how much CO₂ you're saving and what percentage actually gets recycled. That makes the whole environmental impact thing feel real and motivating.

### Technical Learnings

On the technical side, this project was a fantastic learning experience.

**AI/ML Integration** - We figured out how to use Gemini 2.5 Flash through OpenRouter to look at images and pull out the info we needed. Getting the AI to give us consistent JSON responses was tricky. We had to learn how to write prompts that actually work, which taught us a lot about how AI models behave.

**3D Graphics** - We got really into Three.js and React Three Fiber to build the interactive 3D forest. Learning about instanced rendering, geometry baking, and camera controls was a great experience. We had no idea how simple it was to make 3D graphics on a website.

**Image Processing** - We built image processing using Sharp to handle different formats, especially HEIC files from iPhones. We had to resize images and compress them so they wouldn't be too big to send to the API.

**Real-time Data** - Working with Firebase Firestore was interesting. We learned about how to work with real-time databases, how to update statistics without conflicts, and how to structure data.

**Full-Stack Development** - We were relatively new to building a complete app from front to back. We worked with React and TypeScript on the frontend, Node.js and Express on the backend, and figured out how to handle file uploads, design APIs, and manage state.

## How We Built It

### Architecture Overview

Recycle Buddy is a full-stack mobile-first web app. We built it with React on the frontend and Node.js on the backend.

### Frontend

For the frontend, we used React with TypeScript, Vite for building, Motion for animations, Three.js and React Three Fiber.

The main features are pretty straightforward. Users can take a photo or upload an image of something they want to recycle. That image gets sent to our backend where Gemini 2.5 Flash looks at it and figures out what it is. Then we show them the results, which include what category it is (recyclable, compostable, hazardous, or garbage), why we think that, how much CO₂ they're saving, and some helpful tips.

We also built a community forest, which is this 3D visualization that shows everyone's collective impact. The trees grow as more people recycle. Users earn "trees" based on how much they recycle, and there's a progress bar showing how close they are to the next tree. We also have a leaderboard of top contributors to make it a bit competitive.

### Backend

For the backend, we used Node.js with Express, the OpenRouter SDK to talk to the AI model, Firebase Admin SDK for the database, Multer to handle file uploads, and Sharp to process images.

The backend does a few main things. The LLM service talks to Gemini 2.5 Flash through OpenRouter to analyze images and get back structured JSON. We spent a lot of time on the prompts, making sure they include all the Santa Cruz recycling guidelines (we stored those in a constants file) and that the AI always gives us JSON in the format we need.

The image processing handles different formats, especially HEIC files from iPhones. It resizes images to keep the API calls fast and cheap, and converts everything to JPEG so we're always working with the same format.

Firebase handles all the user data. We track global stats like total items scanned, CO₂ saved, and tree count, plus individual stats for each user. We built a REST API with endpoints for analyzing images, managing users, and getting statistics.

Here's how it works when someone scans an item. The user takes or uploads a photo in the React app. That image gets sent to our backend at `/api/callLLM`. The backend processes it, converting HEIC files if needed and resizing everything. Then we send it to Gemini 2.5 Flash through OpenRouter along with a prompt that has all the Santa Cruz recycling guidelines. The AI sends back JSON with the classification, reasoning, and environmental impact. We update Firebase with the new stats, both global and for that specific user. Finally, the frontend shows the results with some nice animations and updates the community forest.

We made a big decision early on to hardcode Santa Cruz recycling guidelines. We did a bunch of research and pulled together all the rules from Santa Cruz County's official guidelines. That includes what goes in the blue bin (recyclables), the green bin (yard waste), the black bin (garbage), and what needs special disposal (hazardous stuff).

We figured being location-specific would make the app way more accurate and useful for people actually living here.

## Challenges We Faced

### No Auth Implementation

We tried to implement our product using no auth. This led to some unforeseen problems once we started trying to track stats for individual users. It is inherently difficult because you lose control for a better user experience, which was one of our design goals. 

### Creating 3D Tree Models in Blender

Making the 3D tree models was rough. None of us really knew how to do 3D modeling, and Blender is not easy to learn. We needed three different tree models that would look good when we rendered hundreds of them together in the forest. We also needed them to be able to render in the hundreds without limiting performance. 

### Additional Technical Challenges

**HEIC Format Support** - iPhone users upload HEIC images by default, and web browsers can't handle those. We had to add server-side conversion using the `heic-convert` library.

**API Payload Size** - Sending huge images to the AI API was expensive and slow. We added automatic resizing (max 1024x1024) and JPEG compression to keep things fast and cheap while still looking good.

**JSON Parsing from AI** - Getting the AI to give us consistent JSON was annoying. Sometimes it would wrap the JSON in markdown code blocks, and we had to handle all sorts of weird response formats. We built error handling for when things went wrong.

**3D Performance** - Rendering hundreds of 3D trees at once could really slow things down. We used React Three Fiber's `Instances` component to render efficiently and did geometry baking to optimize the models.

**Real-time Statistics** - When multiple users scan items at the same time, we had to make sure the global stats updated correctly without conflicts. That took some careful Firebase transaction design.

## Impact and Future

Recycle Buddy has already helped us make better recycling decisions, and we hope it helps other people in Santa Cruz too. Making recycling info easy to access and showing the real environmental impact of choices might encourage more people to recycle right and think about the environment.

Our next steps for Recycle Buddy would be using SLMs to better train the model, so we can be more confident in our answers, and to keep user data private. 

This project taught us that building something you actually need is the best motivation. Combining practical problem-solving with caring about the environment can make tools that actually matter.

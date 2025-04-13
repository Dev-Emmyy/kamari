// Filename: app/api/analyzeimage/route.js

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Helper function to check if a file is a valid image type
function isValidImageType(mimeType) {
    // Gemini 1.5 supports a wider range of types
    const validTypes = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/gif', // Add others if needed and supported
    ];
    return validTypes.includes(mimeType?.toLowerCase()); // Handle potential undefined mimeType
}

// --- Main API Handler ---
export async function POST(request) {
    console.log("API route /api/analyzeimage starting...");

    // --- 1. Initialize Google AI Client ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Missing GEMINI_API_KEY environment variable.");
        return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // Using gemini-1.5-flash
         // Optional: Adjust safety settings if needed (e.g., for product images)
         safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
         ],
    });

    // --- 2. Parse Request Data ---
    let file;
    let mimeType;
    let imageBase64;

    try {
        const formData = await request.formData();
        file = formData.get('image');

        if (!file || typeof file === 'string' || !file.name) {
            console.log("No valid file found in FormData.");
            return NextResponse.json({ error: "No valid image file provided." }, { status: 400 });
        }

        console.log(`Processing file: ${file.name}, Type: ${file.type}, Size: ${file.size}`);

        // --- 3. Validate and Prepare Image Data ---
        mimeType = file.type;
        if (!isValidImageType(mimeType)) {
            console.log(`Invalid image type attempt: ${mimeType}`);
            return NextResponse.json({ error: `Invalid image type: ${mimeType}. Supported types: PNG, JPEG, WEBP, HEIC, HEIF, GIF.` }, { status: 400 });
        }

        // Convert file to base64
        const buffer = Buffer.from(await file.arrayBuffer());
        imageBase64 = buffer.toString('base64');

        console.log(`Converted ${file.name} to base64.`);

    } catch (error) {
        console.error("Error processing form data:", error);
        return NextResponse.json({ error: "Failed to process uploaded file." }, { status: 400 });
    }

    // --- 4. Define Prompt for AI ---
    const prompt = `Analyze the product shown in this image. Provide a concise title (max 10 words) and a brief, objective description (max 3 short sentences) suitable for an inventory listing. Focus only on what is visually present.

    Format the output *exactly* like this:
    Title: [Generated Title]
    Description: [Generated Description]`;

    // --- 5. Prepare AI Input ---
    const imagePart = {
        inlineData: { data: imageBase64, mimeType: mimeType },
    };
    const textPart = { text: prompt };

    // --- 6. Call Google AI API ---
    try {
        console.log("Generating content with Google AI...");
        const result = await model.generateContent([textPart, imagePart]);
        // console.log("Raw AI Result:", JSON.stringify(result, null, 2)); // More detailed log if needed

        if (!result || !result.response) {
             throw new Error("Invalid response structure from AI.");
        }

        const response = result.response;

        // Check for safety blocks or lack of content
        if (response.promptFeedback?.blockReason) {
             console.warn(`AI content blocked due to: ${response.promptFeedback.blockReason}`);
             return NextResponse.json({ error: `Content generation blocked due to safety reasons: ${response.promptFeedback.blockReason}` }, { status: 400 });
         }

        const text = response.text();
        if (!text) {
             console.warn("AI response text is empty.");
              throw new Error("AI returned empty text.");
        }
        console.log("AI Raw Response Text:", text);

        // --- 7. Parse AI Response ---
        let title = "Untitled Item"; // Default
        let description = "No description generated."; // Default

        const titleMatch = text.match(/^Title:\s*(.*)$/im); // Match 'Title:' at line start
        const descriptionMatch = text.match(/^Description:\s*(.*)$/im); // Match 'Description:' at line start

        if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim();
        } else {
             console.warn("Could not parse title from AI response.");
        }
        if (descriptionMatch && descriptionMatch[1]) {
            description = descriptionMatch[1].trim();
        } else {
             console.warn("Could not parse description from AI response.");
             // Maybe use the whole text as description if title wasn't found?
             if (!titleMatch) description = text.trim();
        }

        console.log("Parsed - Title:", title, "Description:", description);

        // --- 8. Return Success Response ---
        return NextResponse.json({ title, description }, { status: 200 });

    } catch (error) {
        console.error("Error during Google AI call or processing:", error);
        return NextResponse.json({ error: `Failed to analyze image. ${error.message || ''}`.trim() }, { status: 500 });
    }
}
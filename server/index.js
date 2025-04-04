import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post("/suggestions", async (req, res) => {
    const { unitsUsed, perUnitCost, totalBill } = req.body;
    console.log("Received request:", { unitsUsed, perUnitCost, totalBill });

    // Add simple validation
    if (!unitsUsed || !perUnitCost || !totalBill) {
        return res.status(400).json({ error: "Missing required values" });
    }

    const prompt = `Provide 3 simple electricity saving tips based on these values: Units: ${unitsUsed}, Cost per unit: ${perUnitCost}, Total Bill: ${totalBill}. Format each tip on a new line starting with a number and a period (Example: "1. Tip one").`;

    try {
        const ollamaResponse = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model: "llama3.2:latest",
                prompt: prompt,
                stream: false,
            },
            {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const suggestions = ollamaResponse.data.response;
        console.log("Ollama returned suggestions:", suggestions);

        res.status(200).json({ suggestions });
    } catch (error) {
        console.error("Error generating suggestions:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
        }
        res.status(500).json({
            error: "Failed to generate suggestions",
            details: error.message,
        });
    }
});

// Add a simple health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const express = require("express");
const mainRouter = require("./routes/index.js");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", mainRouter);

const PORT = 3000;

// app.listen(PORT, () => {
//     console.log(`Backend is running on port ${PORT}`);
// });

// Start the server only if it's not required elsewhere
if (require.main === module) {
    app.listen(3000, () => {
        console.log("Server running on port 3000");
    });
}

// Export the app for testing
module.exports = app;

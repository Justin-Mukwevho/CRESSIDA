// js/data.js

const marketsData = [
    {
        id: 1,
        question: "Will it rain in Johannesburg this afternoon (May 18, 2025)?",
        category: "Weather",
        //image: "images/weather-jhb.jpg", // Optional: Replace with a real or placeholder image path
        description: "This market resolves to YES if there is any measurable precipitation recorded at the official OR Tambo International Airport weather station between 12:00 PM and 6:00 PM SAST on May 18, 2025. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official weather report from OR Tambo International Airport.",
        endDate: "2025-05-18T18:00:00Z",
        yesPrice: 60, // Initial YES price
        noPrice: 40,  // Initial NO price (100 - yesPrice)
        historicalData: {
            labels: ["May 15", "May 16", "May 17", "May 18 (AM)"], // Example time labels
            yes: [50, 55, 58, 60],
            no: [50, 45, 42, 40]
        },
        orderBook: {
            bids: [ // People wanting to BUY YES (or SELL NO)
                { price: 58, quantity: 100 },
                { price: 57, quantity: 50 },
                { price: 55, quantity: 200 }
            ],
            asks: [ // People wanting to SELL YES (or BUY NO)
                { price: 62, quantity: 75 },
                { price: 63, quantity: 25 },
                { price: 65, quantity: 150 }
            ]
        },
        totalVolumeTraded: 17500, // Example value
        totalLiquidity: 5000 // Example sum of quantities in order book or similar metric
    },
    {
        id: 2,
        question: "Will the ANC win a majority in the 2029 SA general elections?",
        category: "Politics",
        //image: "images/politics-sa.jpg", // Optional
        description: "This market resolves to YES if the African National Congress (ANC) secures more than 50% of the national vote in the 2029 South African general elections as certified by the IEC. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official results declared by the Independent Electoral Commission (IEC) of South Africa.",
        endDate: "2029-05-30T23:59:59Z", // Approximate, actual election date TBD
        yesPrice: 50,
        noPrice: 50,
        historicalData: {
            labels: ["Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025"],
            yes: [45, 48, 50, 50, 51],
            no: [55, 52, 50, 50, 49]
        },
        orderBook: {
            bids: [
                { price: 48, quantity: 200 },
                { price: 47, quantity: 150 }
            ],
            asks: [
                { price: 52, quantity: 100 },
                { price: 53, quantity: 50 }
            ]
        },
        totalVolumeTraded: 32000,
        totalLiquidity: 7500
    },
    {
        id: 3,
        question: "Will Max Verstappen win the 2025 F1 World Championship?",
        category: "Sports",
        //image: "images/f1-verstappen.jpg", // Optional
        description: "This market resolves to YES if Max Verstappen is officially declared the winner of the 2025 Formula 1 World Drivers' Championship by the FIA. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official FIA declaration.",
        endDate: "2025-12-01T23:59:59Z", // Approximate end of F1 season
        yesPrice: 70,
        noPrice: 30,
        historicalData: {
            labels: ["Pre-Season", "Race 1", "Race 2", "Race 3", "Current"],
            yes: [65, 68, 70, 70, 72],
            no: [35, 32, 30, 30, 28]
        },
        orderBook: {
            bids: [
                { price: 68, quantity: 100 },
                { price: 67, quantity: 50 }
            ],
            asks: [
                { price: 72, quantity: 75 },
                { price: 73, quantity: 25 }
            ]
        },
        totalVolumeTraded: 45000,
        totalLiquidity: 9000
    },
    {
        id: 4,
        question: "Will Eskom implement Stage 4 loadshedding or higher next week (May 19-25, 2025)?",
        category: "Current Affairs", // Or "Utilities", "SA News"
        //image: "images/eskom-loadshedding.jpg", // Optional
        description: "This market resolves to YES if Eskom officially announces and implements Stage 4 loadshedding (or any stage higher than 4) at any point for the national grid between Monday, May 19, 2025, 00:00 SAST and Sunday, May 25, 2025, 23:59 SAST. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official Eskom communications (e.g., press releases, official social media).",
        endDate: "2025-05-25T23:59:59Z",
        yesPrice: 35,
        noPrice: 65,
        historicalData: {
            labels: ["May 12", "May 13", "May 14", "May 15", "May 18"],
            yes: [20, 25, 30, 33, 35],
            no: [80, 75, 70, 67, 65]
        },
        orderBook: {
            bids: [
                { price: 33, quantity: 500 },
                { price: 32, quantity: 300 }
            ],
            asks: [
                { price: 37, quantity: 400 },
                { price: 38, quantity: 250 }
            ]
        },
        totalVolumeTraded: 25000,
        totalLiquidity: 6000
    },
    // Add more markets as desired
    // Ensure to have a variety of categories and types of markets for testing
    {
        id: 5,
        question: "Will the Springboks win the 2025 Rugby World Cup?",
        category: "Sports",
        //image: "images/rugby-springboks.jpg", // Optional
        description: "This market resolves to YES if the South African national rugby team, the Springboks, wins the 2025 Rugby World Cup. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official Rugby World Cup results.",
        endDate: "2025-10-28T23:59:59Z", // Approximate end of tournament
        yesPrice: 80,
        noPrice: 20,
        historicalData: {
            labels: ["Pre-Tournament", "Quarterfinals", "Semifinals", "Final"],
            yes: [75, 78, 80, 82],
            no: [25, 22, 20, 18]
        },
        orderBook: {
            bids: [
                { price: 78, quantity: 200 },
                { price: 77, quantity: 150 }
            ],
            asks: [
                { price: 82, quantity: 100 },
                { price: 83, quantity: 50 }
            ]
        },
        totalVolumeTraded: 60000,
        totalLiquidity: 12000
    },
    {
        id: 6,
        question: "Will Kelvin Momo release a new album in 2025?",
        category: "Entertainment",
        //image: "images/kelvin-momo.jpg", // Optional
        description: "This market resolves to YES if South African musician Kelvin Momo releases a new album in 2025. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official announcements from Kelvin Momo or his record label.",
        endDate: "2025-12-31T23:59:59Z", // End of the year
        yesPrice: 90,
        noPrice: 10,
        historicalData: {
            labels: ["2024-01", "2024-06", "2024-12", "2025-06"],
            yes: [85, 88, 90, 92],
            no: [15, 12, 10, 8]
        },
        orderBook: {
            bids: [
                { price: 88, quantity: 100 },
                { price: 87, quantity: 50 }
            ],
            asks: [
                { price: 92, quantity: 75 },
                { price: 93, quantity: 25 }
            ]
        },
        totalVolumeTraded: 15000,
        totalLiquidity: 3000

    },
{
        id: 7,
        question: "Will Stage 8 loadshedding be implemented in South Africa in 2025?",
        category: "Politics",
        //image: "images/stage-8-loadshedding.jpg", // Optional
        description: "This market resolves to YES if Eskom officially announces and implements Stage 8 loadshedding at any point in South Africa in 2025. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official Eskom communications (e.g., press releases, official social media).",
        endDate: "2025-12-31T23:59:59Z", // End of the year
        yesPrice: 20,
        noPrice: 80,
        historicalData: {
            labels: ["2024-01", "2024-06", "2024-12", "2025-06"],
            yes: [15, 18, 20, 22],
            no: [85, 82, 80, 78]
        },
        orderBook: {
            bids: [
                { price: 18, quantity: 200 },
                { price: 17, quantity: 150 }
            ],
            asks: [
                { price: 22, quantity: 100 },
                { price: 23, quantity: 50 }
            ]
        },
        totalVolumeTraded: 20000,
        totalLiquidity: 4000
    },
    {
        id: 8,
        question: "Will new legislation be passed in South Africa to regulate cryptocurrency trading in 2025?",
        category: "Politics",
        //image: "images/crypto-regulation.jpg", // Optional
        description: "This market resolves to YES if the South African government passes new legislation to regulate cryptocurrency trading in 2025. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official government announcements or publications.",
        endDate: "2025-12-31T23:59:59Z", // End of the year
        yesPrice: 75,
        noPrice: 25,
        historicalData: {
            labels: ["2024-01", "2024-06", "2024-12", "2025-06"],
            yes: [70, 73, 75, 77],
            no: [30, 27, 25, 23]
        },
        orderBook: {
            bids: [
                { price: 73, quantity: 100 },
                { price: 72, quantity: 50 }
            ],
            asks: [
                { price: 77, quantity: 75 },
                { price: 78, quantity: 25 }
            ]
        },
        totalVolumeTraded: 30000,
        totalLiquidity: 6000
    },
    
    {
        id: 9,
        question: "Will the DA win more than 30% of the vote in the 2029 SA general elections?",
        category: "Politics",
        //image: "images/da-elections.jpg", // Optional
        description: "This market resolves to YES if the Democratic Alliance (DA) secures more than 30% of the national vote in the 2029 South African general elections as certified by the IEC. Otherwise, it resolves to NO.",
        resolutionCriteria: "Official results declared by the Independent Electoral Commission (IEC) of South Africa.",
        endDate: "2029-12-31T23:59:59Z", // End of the year
        yesPrice: 65,
        noPrice: 35,
        historicalData: {
            labels: ["2028-01", "2028-06", "2028-12", "2029-06"],
            yes: [60, 62, 65, 67],
            no: [40, 38, 35, 33]
        },
        orderBook: {
            bids: [
                { price: 62, quantity: 100 },
                { price: 61, quantity: 50 }
            ],
            asks: [
                { price: 67, quantity: 75 },
                { price: 68, quantity: 25 }
            ]
        },
        totalVolumeTraded: 40000,
        totalLiquidity: 8000
    }


];

// In a real app, NEVER store passwords in plain text. This is for static prototype simulation ONLY.
const usersData = [
    {
        id: 1,
        username: "Justin",
        password: "password", // Highly insecure, for simulation only
        balance: 1525300.00,
        portfolio: [
            { marketId: 1, marketQuestion: "Will it rain in Johannesburg this afternoon (May 18, 2025)?", outcome: "YES", quantity: 100, avgPricePaid: 58 },
            { marketId: 2, marketQuestion: "Will the ANC win a majority in the 2029 SA general elections?", outcome: "NO", quantity: 50, avgPricePaid: 50 },
            { marketId: 3, marketQuestion: "Will Max Verstappen win the 2025 F1 World Championship?", outcome: "YES", quantity: 200, avgPricePaid: 70 },
            { marketId: 4, marketQuestion: "Will Eskom implement Stage 4 loadshedding or higher next week (May 19-25, 2025)?", outcome: "NO", quantity: 150, avgPricePaid: 65 },
            { marketId: 5, marketQuestion: "Will the Springboks win the 2025 Rugby World Cup?", outcome: "YES", quantity: 300, avgPricePaid: 80 },
            { marketId: 6, marketQuestion: "Will Kelvin Momo release a new album in 2025?", outcome: "YES", quantity: 50, avgPricePaid: 90 },
            { marketId: 7, marketQuestion: "Will Stage 8 loadshedding be implemented in South Africa in 2025?", outcome: "NO", quantity: 100, avgPricePaid: 20 },
            { marketId: 8, marketQuestion: "Will new legislation be passed in South Africa to regulate cryptocurrency trading in 2025?", outcome: "YES", quantity: 200, avgPricePaid: 75 }
        ]
    },
    {
        id: 2,
        username: "Thandi",
        password: "securepassword", // Highly insecure, for simulation only
        balance: 1200.00,
        portfolio: [
            { marketId: 3, marketQuestion: "Will Max Verstappen win the 2025 F1 World Championship?", outcome: "YES", quantity: 150, avgPricePaid: 68 }
        ]
    },
    {
        id: 3,
        username: "DemoUser",
        password: "demo",
        balance: 5000.00,
        portfolio: []
    }
    // Add more users for registration/login testing if needed
];

const leaderboardData = [
    { rank: 1, username: "Justin", profit: 2000421.75, volume: 10000000.00, winRate: 50 }, // Added winRate for more detail
    { rank: 2, username: "SuperTrader", profit: 1850.50, volume: 22000.00, winRate: 70 },
    { rank: 3, username: "Jessica", profit: 1300.00, volume: 15000.00, winRate: 55 },
    { rank: 4, username: "Jacob", profit: 950.20, volume: 18000.00, winRate: 60 },
    { rank: 5, username: "CryptoKing", profit: 780.00, volume: 30000.00, winRate: 50 },
    { rank: 6, username: "Thandi", profit: 600.00, volume: 12200.00, winRate: 75 },
    { rank: 7, username: "John", profit: 450.90, volume: 8200.00, winRate: 58 },
    { rank: 8, username: "Jane", profit: 250.00, volume: 5300.00, winRate: 52 }
];

// It might be useful to have a global object to hold the current state of data
// that can be manipulated by simulated trades/deposits.
// We can initialize it as a deep copy of the original data.
let currentAppState = {
    markets: JSON.parse(JSON.stringify(marketsData)),
    users: JSON.parse(JSON.stringify(usersData)), // Users array for managing multiple users locally
    loggedInUser: null // Will be set after successful login
};

// If you add images, make sure the paths in `marketsData` like "images/weather-jhb.jpg"
// correspond to actual files in your `images/` folder. You can use placeholder images for now.
// Example for placeholder image services: https://placeholder.com/ (e.g. https://via.placeholder.com/300x200)
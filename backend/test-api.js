// Test script untuk API backend
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000/api";
let token = "";
let categoryId = "";
let taskId = "";

async function request(method, endpoint, body = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data };
}

async function runTests() {
    console.log("🧪 TESTING BACKEND API\n");
    console.log("=".repeat(50));

    // 1. Test Health
    console.log("\n1️⃣ TEST HEALTH CHECK");
    let result = await request("GET", "/health");
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);

    // 2. Test Login
    console.log("\n2️⃣ TEST LOGIN");
    result = await request("POST", "/auth/login", {
        username: "admin",
        password: "admin123"
    });
    console.log(`   Status: ${result.status}`);
    if (result.status === 200) {
        token = result.data.token;
        console.log(`   Token: ${token.substring(0, 50)}...`);
        console.log(`   Role: ${result.data.role}`);
    } else {
        console.log(`   Error:`, result.data);
        return;
    }

    // 3. Test Create Category (or get existing)
    console.log("\n3️⃣ TEST CREATE CATEGORY");
    result = await request("POST", "/categories", {
        name: "Testing Category",
        description: "Kategori untuk testing",
        color: "#EF4444"
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    if (result.status === 201) {
        categoryId = result.data._id;
    } else {
        // Get first category if creation fails (already exists)
        const cats = await request("GET", "/categories");
        if (cats.data.length > 0) {
            categoryId = cats.data[0]._id;
            console.log(`   Using existing category ID: ${categoryId}`);
        }
    }

    // 4. Test Create Category 2
    console.log("\n4️⃣ TEST CREATE CATEGORY 2");
    result = await request("POST", "/categories", {
        name: "Pribadi",
        description: "Tugas-tugas pribadi",
        color: "#10B981"
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);

    // 5. Test Get All Categories
    console.log("\n5️⃣ TEST GET ALL CATEGORIES");
    result = await request("GET", "/categories");
    console.log(`   Status: ${result.status}`);
    console.log(`   Total: ${result.data.length} categories`);
    result.data.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.color})`);
    });

    // 6. Test Create Task
    console.log("\n6️⃣ TEST CREATE TASK");
    result = await request("POST", "/tasks", {
        title: "Buat laporan bulanan",
        description: "Laporan keuangan bulan Januari",
        priority: "HIGH",
        category: categoryId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 hari lagi
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    if (result.status === 201) {
        taskId = result.data._id;
    }

    // 7. Test Create Task 2
    console.log("\n7️⃣ TEST CREATE TASK 2");
    result = await request("POST", "/tasks", {
        title: "Review code PR",
        description: "Review pull request dari tim",
        priority: "MEDIUM"
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);

    // 8. Test Get All Tasks
    console.log("\n8️⃣ TEST GET ALL TASKS");
    result = await request("GET", "/tasks");
    console.log(`   Status: ${result.status}`);
    console.log(`   Total: ${result.data.length} tasks`);
    result.data.forEach(task => {
        console.log(`   - [${task.isCompleted ? '✓' : ' '}] ${task.title} (${task.priority})`);
    });

    // 9. Test Toggle Task Complete
    console.log("\n9️⃣ TEST TOGGLE TASK COMPLETE");
    result = await request("PATCH", `/tasks/${taskId}/toggle`);
    console.log(`   Status: ${result.status}`);
    console.log(`   isCompleted: ${result.data.isCompleted}`);

    // 10. Test Get Task Stats
    console.log("\n🔟 TEST GET TASK STATS");
    result = await request("GET", "/tasks/stats");
    console.log(`   Status: ${result.status}`);
    console.log(`   Stats:`, result.data);

    // 11. Test Update Task
    console.log("\n1️⃣1️⃣ TEST UPDATE TASK");
    result = await request("PUT", `/tasks/${taskId}`, {
        title: "Buat laporan bulanan (UPDATED)",
        priority: "LOW"
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Updated title: ${result.data.title}`);
    console.log(`   Updated priority: ${result.data.priority}`);

    // 12. Test Filter Tasks by Category
    console.log("\n1️⃣2️⃣ TEST FILTER TASKS BY CATEGORY");
    result = await request("GET", `/tasks?category=${categoryId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Total: ${result.data.length} tasks in category`);

    // 13. Test Update Category
    console.log("\n1️⃣3️⃣ TEST UPDATE CATEGORY");
    result = await request("PUT", `/categories/${categoryId}`, {
        name: "Pekerjaan Kantor",
        color: "#F59E0B"
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Updated name: ${result.data.name}`);

    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL TESTS COMPLETED!");
    console.log("=".repeat(50));
}

runTests().catch(console.error);

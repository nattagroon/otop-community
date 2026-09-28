// ============================================
// script.js — OTOP Frontend CRUD
// ============================================

const API_URL = "/api/products";

// 1. ฟังก์ชันโหลดและแสดงผลสินค้าทั้งหมด
async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    const products = await response.json();
    
    // ผมจึงอิงตามตัวแปร grid เดิมของคุณที่เป็น document.getElementById("card-grid") ครับ
    const grid = document.getElementById("card-grid");
    if (!grid) return;

    grid.innerHTML = "";

    products.forEach(product => {
      // 🌟 แก้ไข: เปลี่ยนจาก "div" เป็น "article"
      const card = document.createElement("article");
      card.className = "card";
      
      // 🌟 แก้ไข: อัปเดตโครงสร้าง HTML ด้านใน card ให้ตรงตามภาพ
      card.innerHTML = `
        ${product.image_path ? `
          <div class="card-image">
            <img src="${product.image_path}" alt="${product.name}">
          </div>
        ` : `
          <div class="card-image no-image">
            <span>📷 ไม่มีรูปภาพ</span>
          </div>
        `}
        <div class="card-content">
          <div class="card-header">
            <h3>${product.name}</h3>
            <span class="category-badge">${product.category}</span>
          </div>
          <p class="producer">🏭 ${product.producer}</p>
          ${product.contact ? `<p class="contact">📞 ${product.contact}</p>` : ""}
          
          <!-- 🌟 ส่วนที่ต้องแก้ตามสไลด์: เพิ่ม card-actions และปุ่ม edit-btn -->
          <div class="card-footer">
            <span class="price">฿ ${product.price.toLocaleString()}</span>
            <div class="card-actions">
              <button class="edit-btn" data-id="${product.id}">✏️ แก้</button>
              <button class="delete-btn" data-id="${product.id}">🗑️ ลบ</button>
            </div>
          </div>
        </div>
      `;
      
      grid.appendChild(card);
    });

    // ผูก Event ให้ปุ่มลบหลังจากเรนเดอร์การ์ดเสร็จ
    attachDeleteHandlers();
    attachEditHandlers();
    
    // 🌟 ส่วนที่ต้องเพิ่ม: เรียกใช้ฟังก์ชันผูก Event ให้ปุ่มแก้ไขที่คุณเขียนเตรียมไว้แล้ว
    attachEditHandlers();

  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดสินค้า:", error);
  }
}

// 2. ฟังก์ชันจัดการการลบสินค้า
function attachDeleteHandlers() {
  const deleteButtons = document.querySelectorAll(".delete-btn");
  
  deleteButtons.forEach(button => {
    button.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      
      if (confirm("คุณต้องการลบผลิตภัณฑ์นี้ใช่หรือไม่?")) {
        try {
          const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
          });
          
          if (response.ok) {
            loadProducts(); // โหลดข้อมูลใหม่หลังลบสำเร็จ
          } else {
            alert("ไม่สามารถลบผลิตภัณฑ์ได้");
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการลบ:", error);
        }
      }
    });
  });
}

// 3. ฟังก์ชันจัดการการเพิ่มสินค้าผ่านฟอร์ม (Add Form)
const addForm = document.getElementById("add-product-form");
if (addForm) {
  addForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 🌟 ใช้ FormData แทน JSON
    const formData = new FormData();
    formData.append("name", document.getElementById("product-name").value);
    formData.append("producer", document.getElementById("product-producer").value);
    formData.append("price", document.getElementById("product-price").value);
    formData.append("category", document.getElementById("product-category").value);
    formData.append("contact", document.getElementById("product-contact").value);

    // ถ้ามีไฟล์ -> append
    const fileInput = document.getElementById("product-image");
    if (fileInput && fileInput.files[0]) {
      formData.append("image", fileInput.files[0]); 
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData
        // ⚠️ ห้ามใส่ Content-Type! browser ตั้งเอง
      });

      // === แก้ไขการเช็คสถานะและแจ้งเตือนตามภาพล่าสุด ===
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "เพิ่มไม่สำเร็จ");
      }

      addForm.reset();
      loadProducts();
      alert("✅ เพิ่มผลิตภัณฑ์สำเร็จ");

    } catch (error) {
      alert("❌ " + error.message);
    }
  });
}
// ============================================
// Edit Modal Elements
// ============================================
const modal = document.getElementById("edit-modal");
const closeBtn = document.getElementById("modal-close");
const cancelBtn = document.getElementById("cancel-btn");
const editForm = document.getElementById("edit-form");

// ============================================
// Open/Close Modal
// ============================================
function openEditModal(product) {
  // Populate form
  document.getElementById("edit-id").value = product.id;
  document.getElementById("edit-name").value = product.name;
  document.getElementById("edit-producer").value = product.producer;
  document.getElementById("edit-price").value = product.price;
  document.getElementById("edit-category").value = product.category;
  document.getElementById("edit-contact").value = product.contact || "";

  // Show modal
  modal.classList.remove("hidden");
}

function closeEditModal() {
  modal.classList.add("hidden");
  editForm.reset();
}

// ปิดด้วยปุ่ม X และปุ่ม Cancel
closeBtn.addEventListener("click", closeEditModal);
cancelBtn.addEventListener("click", closeEditModal);

// ปิดเมื่อคลิก overlay (พื้นหลัง)
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeEditModal();
  }
});

// ปิดด้วย ESC
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeEditModal();
  }
});

// ============================================
// Submit Edit Form
// ============================================
editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("edit-id").value;
  const updatedData = {
    name: document.getElementById("edit-name").value,
    producer: document.getElementById("edit-producer").value,
    price: Number(document.getElementById("edit-price").value),
    category: document.getElementById("edit-category").value,
    contact: document.getElementById("edit-contact").value || null
  };

  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "แก้ไขไม่สำเร็จ");
    }

    closeEditModal();
    loadProducts();
    alert("✅ บันทึกสำเร็จ");

  } catch (error) {
    alert("❌ " + error.message);
  }
});

// ============================================
// Attach Edit Handlers (call after render)
// ============================================
function attachEditHandlers() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      // Fetch product data
      const response = await fetch(`/api/products/${id}`);
      const product = await response.json();

      openEditModal(product);
    });
  });
}

// โหลดข้อมูลสินค้าทันทีเมื่อเปิดหน้าเว็บ
document.addEventListener("DOMContentLoaded", 
  loadProducts);
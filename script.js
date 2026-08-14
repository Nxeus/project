const STORAGE_KEY = "nxeus_goal_data";

const defaultData = {
    target: 14000000,
    saved: 0,
    history: [],
    products: []
};

let data = loadData();
let editingProductId = null;


/* =========================
   STORAGE
========================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(defaultData);
        }

        const parsed = JSON.parse(saved);

        return {
            target: Number(parsed.target) || defaultData.target,
            saved: Number(parsed.saved) || 0,
            history: Array.isArray(parsed.history)
                ? parsed.history
                : [],
            products: Array.isArray(parsed.products)
                ? parsed.products
                : []
        };

    } catch (error) {
        console.error("Gagal membaca data:", error);
        return structuredClone(defaultData);
    }
}


function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    updateSaveStatus();
}


function updateSaveStatus() {
    const status = document.querySelector(".save-status");

    if (!status) return;

    status.innerHTML = `
        <i></i>
        Tersimpan
    `;
}


/* =========================
   FORMAT
========================= */

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}


function formatShortRupiah(value) {
    value = Number(value) || 0;

    if (value >= 1000000000) {
        return `Rp${(value / 1000000000)
            .toFixed(1)
            .replace(".0", "")}M`;
    }

    if (value >= 1000000) {
        return `Rp${(value / 1000000)
            .toFixed(1)
            .replace(".0", "")}jt`;
    }

    if (value >= 1000) {
        return `Rp${(value / 1000)
            .toFixed(0)}rb`;
    }

    return `Rp${value}`;
}


function formatDate(date) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }

    return parsed.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================
   PROGRESS
========================= */

function updateProgress() {
    const target = Math.max(Number(data.target), 1);
    const saved = Math.max(Number(data.saved), 0);

    const percentage = Math.min(
        Math.max((saved / target) * 100, 0),
        100
    );

    const remaining = Math.max(
        target - saved,
        0
    );

    const percentageRounded =
        Math.round(percentage);

    const percentageElement =
        document.getElementById("percentage");

    const percentageText =
        document.getElementById("percentageText");

    const savedAmount =
        document.getElementById("savedAmount");

    const targetAmount =
        document.getElementById("targetAmount");

    const remainingAmount =
        document.getElementById("remainingAmount");

    const savedShort =
        document.getElementById("savedShort");

    const targetShort =
        document.getElementById("targetShort");

    const remainingShort =
        document.getElementById("remainingShort");

    const progressFill =
        document.getElementById("progressFill");

    const progressCircle =
        document.getElementById("progressCircle");


    if (percentageElement) {
        percentageElement.textContent =
            `${percentageRounded}%`;
    }

    if (percentageText) {
        percentageText.textContent =
            `${percentageRounded}%`;
    }

    if (savedAmount) {
        savedAmount.textContent =
            formatRupiah(saved);
    }

    if (targetAmount) {
        targetAmount.textContent =
            `/ ${formatRupiah(target)}`;
    }

    if (remainingAmount) {
        remainingAmount.textContent =
            remaining > 0
                ? `${formatRupiah(remaining)} lagi`
                : "Target tercapai 🎉";
    }

    if (savedShort) {
        savedShort.textContent =
            formatShortRupiah(saved);
    }

    if (targetShort) {
        targetShort.textContent =
            formatShortRupiah(target);
    }

    if (remainingShort) {
        remainingShort.textContent =
            formatShortRupiah(remaining);
    }

    if (progressFill) {
        progressFill.style.width =
            `${percentage}%`;
    }

    if (progressCircle) {
        progressCircle.style.setProperty(
            "--progress",
            `${percentage}%`
        );
    }
}


/* =========================
   TRANSAKSI
========================= */

function addTransaction(type, amount, description) {

    amount = Number(amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Nominal harus lebih dari 0.");
        return false;
    }

    description = description.trim();

    if (!description) {
        alert("Deskripsi wajib diisi.");
        return false;
    }


    if (type === "add") {
        data.saved += amount;
    }

    if (type === "subtract") {

        if (amount > data.saved) {
            const confirmResult = confirm(
                "Pengeluaran lebih besar dari tabungan saat ini. Tetap lanjut?"
            );

            if (!confirmResult) {
                return false;
            }
        }

        data.saved -= amount;
    }


    data.history.unshift({
        id: createId(),
        type,
        amount,
        description,
        date: new Date().toISOString()
    });


    saveData();
    updateAll();

    return true;
}


/* =========================
   RIWAYAT
========================= */

function renderHistory() {

    const body =
        document.getElementById("historyBody");

    const empty =
        document.getElementById("emptyState");

    if (!body) return;


    body.innerHTML = "";


    if (data.history.length === 0) {

        if (empty) {
            empty.style.display = "flex";
        }

        return;
    }


    if (empty) {
        empty.style.display = "none";
    }


    data.history.forEach(transaction => {

        const row =
            document.createElement("tr");

        const isAdd =
            transaction.type === "add";

        const sign =
            isAdd ? "+" : "−";

        const className =
            isAdd ? "plus" : "minus";

        const typeText =
            isAdd
                ? "Pemasukan"
                : "Pengeluaran";


        row.innerHTML = `
            <td>
                <span class="${className}">
                    ${sign} ${typeText}
                </span>
            </td>

            <td class="${className}">
                ${sign}${formatRupiah(transaction.amount)}
            </td>

            <td>
                ${escapeHtml(transaction.description)}
            </td>

            <td>
                ${formatDate(transaction.date)}
            </td>
        `;

        body.appendChild(row);
    });
}


/* =========================
   TARGET
========================= */

function updateTarget() {

    const input =
        document.getElementById("targetInput");

    if (!input) return;

    input.value = data.target;
}


function setTarget() {

    const input =
        document.getElementById("targetInput");

    const target =
        Number(input.value);

    if (!Number.isFinite(target) || target <= 0) {
        alert("Target harus lebih dari 0.");
        return;
    }

    data.target = target;

    saveData();
    updateAll();

    input.value = target;

    alert("Target berhasil diperbarui.");
}


/* =========================
   PRODUCTS
========================= */

function createId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8)
    );
}


function renderProducts() {

    const list =
        document.getElementById("productList");

    const empty =
        document.getElementById("productEmpty");

    if (!list) return;


    list.innerHTML = "";


    if (data.products.length === 0) {

        list.style.display = "none";

        if (empty) {
            empty.classList.remove(
                "product-empty-hidden"
            );
        }

        return;
    }


    list.style.display = "grid";

    if (empty) {
        empty.classList.add(
            "product-empty-hidden"
        );
    }


    data.products.forEach(product => {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        card.innerHTML = `
            <h3 class="product-name">
                ${escapeHtml(product.name)}
            </h3>

            <div class="product-price">
                ${formatRupiah(product.price)}
            </div>

            ${
                product.link
                    ? `
                    <a
                        class="product-link"
                        href="${escapeAttribute(product.link)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Buka produk ↗
                    </a>
                    `
                    : `
                    <div class="product-link">
                        Tidak ada link
                    </div>
                    `
            }

            <div class="product-actions">

                <button
                    class="edit-product"
                    data-action="edit"
                    data-id="${product.id}"
                >
                    Edit
                </button>

                <button
                    class="delete-product"
                    data-action="delete"
                    data-id="${product.id}"
                >
                    Hapus
                </button>

            </div>
        `;


        list.appendChild(card);
    });
}


/* =========================
   MODAL PRODUCT
========================= */

function openProductModal(product = null) {

    const modal =
        document.getElementById("productModal");

    const title =
        document.getElementById("modalTitle");

    const name =
        document.getElementById("productName");

    const price =
        document.getElementById("productPrice");

    const link =
        document.getElementById("productLink");


    if (!modal) return;


    if (product) {

        editingProductId =
            product.id;

        title.textContent =
            "Edit barang";

        name.value =
            product.name;

        price.value =
            product.price;

        link.value =
            product.link || "";

    } else {

        editingProductId = null;

        title.textContent =
            "Tambah barang";

        name.value = "";
        price.value = "";
        link.value = "";
    }


    modal.classList.add("show");

    setTimeout(() => {
        name.focus();
    }, 100);
}


function closeProductModal() {

    const modal =
        document.getElementById("productModal");

    if (!modal) return;

    modal.classList.remove("show");

    editingProductId = null;
}


function saveProduct() {

    const nameInput =
        document.getElementById("productName");

    const priceInput =
        document.getElementById("productPrice");

    const linkInput =
        document.getElementById("productLink");


    const name =
        nameInput.value.trim();

    const price =
        Number(priceInput.value);

    const link =
        linkInput.value.trim();


    if (!name) {
        alert("Nama barang wajib diisi.");
        nameInput.focus();
        return;
    }


    if (!Number.isFinite(price) || price < 0) {
        alert("Harga tidak valid.");
        priceInput.focus();
        return;
    }


    if (link && !isValidUrl(link)) {
        alert("Link produk tidak valid.");
        linkInput.focus();
        return;
    }


    if (editingProductId) {

        const product =
            data.products.find(
                item =>
                    item.id === editingProductId
            );

        if (product) {

            product.name = name;
            product.price = price;
            product.link = link;
        }

    } else {

        data.products.unshift({
            id: createId(),
            name,
            price,
            link,
            createdAt:
                new Date().toISOString()
        });
    }


    saveData();
    renderProducts();
    closeProductModal();
}


function editProduct(id) {

    const product =
        data.products.find(
            item => item.id === id
        );

    if (!product) return;

    openProductModal(product);
}


function deleteProduct(id) {

    const product =
        data.products.find(
            item => item.id === id
        );

    if (!product) return;


    const confirmed =
        confirm(
            `Hapus "${product.name}" dari daftar barang?`
        );

    if (!confirmed) return;


    data.products =
        data.products.filter(
            item => item.id !== id
        );


    saveData();
    renderProducts();
}


/* =========================
   VALIDATION
========================= */

function isValidUrl(value) {

    try {

        const url =
            new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {
        return false;
    }
}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {
    return escapeHtml(value);
}


/* =========================
   NAVIGASI
========================= */

function switchPage(pageName) {

    const pages = {
        progress:
            document.getElementById(
                "page-progress"
            ),

        history:
            document.getElementById(
                "page-history"
            ),

        products:
            document.getElementById(
                "page-products"
            )
    };


    Object.values(pages).forEach(page => {

        if (page) {
            page.classList.remove("active");
        }
    });


    if (pages[pageName]) {
        pages[pageName].classList.add("active");
    }


    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );
        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   RESET
========================= */

function resetData() {

    const confirmed =
        confirm(
            "Yakin ingin menghapus semua progress, riwayat, dan daftar barang?"
        );

    if (!confirmed) return;


    data = structuredClone(defaultData);

    saveData();
    updateAll();

    alert("Semua data berhasil direset.");
}


/* =========================
   EVENT LISTENERS
========================= */

function setupEvents() {

    const addButton =
        document.getElementById("addButton");

    const subtractButton =
        document.getElementById(
            "subtractButton"
        );

    const targetButton =
        document.getElementById(
            "targetButton"
        );

    const resetButton =
        document.getElementById(
            "resetButton"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                const amount =
                    document.getElementById(
                        "addInput"
                    ).value;

                const description =
                    document.getElementById(
                        "addDescription"
                    ).value;


                const success =
                    addTransaction(
                        "add",
                        amount,
                        description
                    );


                if (success) {

                    document.getElementById(
                        "addInput"
                    ).value = "";

                    document.getElementById(
                        "addDescription"
                    ).value = "";
                }
            }
        );
    }


    if (subtractButton) {

        subtractButton.addEventListener(
            "click",
            () => {

                const amount =
                    document.getElementById(
                        "subtractInput"
                    ).value;

                const description =
                    document.getElementById(
                        "subtractDescription"
                    ).value;


                const success =
                    addTransaction(
                        "subtract",
                        amount,
                        description
                    );


                if (success) {

                    document.getElementById(
                        "subtractInput"
                    ).value = "";

                    document.getElementById(
                        "subtractDescription"
                    ).value = "";
                }
            }
        );
    }


    if (targetButton) {
        targetButton.addEventListener(
            "click",
            setTarget
        );
    }


    if (resetButton) {
        resetButton.addEventListener(
            "click",
            resetData
        );
    }


    /* NAVIGATION */

    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    switchPage(
                        button.dataset.page
                    );
                }
            );
        });


    /* PRODUCT MODAL */

    const openProductModalButton =
        document.getElementById(
            "openProductModal"
        );

    const emptyAddProduct =
        document.getElementById(
            "emptyAddProduct"
        );

    const closeProductModalButton =
        document.getElementById(
            "closeProductModal"
        );

    const cancelProduct =
        document.getElementById(
            "cancelProduct"
        );

    const saveProductButton =
        document.getElementById(
            "saveProduct"
        );


    if (openProductModalButton) {

        openProductModalButton.addEventListener(
            "click",
            () => openProductModal()
        );
    }


    if (emptyAddProduct) {

        emptyAddProduct.addEventListener(
            "click",
            () => openProductModal()
        );
    }


    if (closeProductModalButton) {

        closeProductModalButton.addEventListener(
            "click",
            closeProductModal
        );
    }


    if (cancelProduct) {

        cancelProduct.addEventListener(
            "click",
            closeProductModal
        );
    }


    if (saveProductButton) {

        saveProductButton.addEventListener(
            "click",
            saveProduct
        );
    }


    /* CLICK PRODUCT */

    const productList =
        document.getElementById(
            "productList"
        );

    if (productList) {

        productList.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );

                if (!button) return;


                const id =
                    button.dataset.id;

                const action =
                    button.dataset.action;


                if (action === "edit") {
                    editProdu

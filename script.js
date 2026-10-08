// Database State dengan Penambahan Master Data Kain Baru (Taslan, Japan Drill, Softshell, Cordura)
let inventoryData = JSON.parse(localStorage.getItem('simp_inventory')) || [
    { code: "KAIN-01", name: "Cotton Combed 24s (1kg)", price: 136000, stock: 25, reorder: 30, unit: "Kg", yieldPcs: 4 },
    { code: "KAIN-02", name: "Cotton Combed 30s (1kg)", price: 138000, stock: 40, reorder: 50, unit: "Kg", yieldPcs: 5 },
    { code: "KAIN-03", name: "Fleece Cotton (1kg)", price: 124500, stock: 30, reorder: 25, unit: "Kg", yieldPcs: 1.5 },
    { code: "KAIN-04", name: "Fleece CVC (1kg)", price: 101000, stock: 50, reorder: 30, unit: "Kg", yieldPcs: 2 },
    { code: "KAIN-05", name: "Kain Unione (per meter)", price: 28000, stock: 60, reorder: 90, unit: "Meter", yieldPcs: 0.67 },
    { code: "KAIN-06", name: "Kain Taslan (1 yard)", price: 23000, stock: 80, reorder: 40, unit: "Yard", yieldPcs: 1 },
    { code: "KAIN-07", name: "Kain Japan Drill (1 meter)", price: 35000, stock: 75, reorder: 35, unit: "Meter", yieldPcs: 1 },
    { code: "KAIN-08", name: "Softshell Bonding (1 yard)", price: 70000, stock: 40, reorder: 20, unit: "Yard", yieldPcs: 1 },
    { code: "KAIN-09", name: "Cordura (1 yard)", price: 50000, stock: 50, reorder: 25, unit: "Yard", yieldPcs: 1 }
];

let mutationHistory = JSON.parse(localStorage.getItem('simp_mutations')) || [
    { time: "2026-10-08 08:30", name: "Cotton Combed 30s (1kg)", type: "MASUK", qty: 20, note: "Penerimaan dari Supplier" }
];

let purchaseOrders = JSON.parse(localStorage.getItem('simp_pos')) || [
    { id: "PO-101", supplier: "PT Textile Nusantara Utama", itemName: "Cotton Combed 30s (1kg)", qty: 20, status: "Menunggu Pengiriman" }
];

document.addEventListener("DOMContentLoaded", () => {
    refreshAllViews();
    calculateHPP();
});

function saveState() {
    localStorage.setItem('simp_inventory', JSON.stringify(inventoryData));
    localStorage.setItem('simp_mutations', JSON.stringify(mutationHistory));
    localStorage.setItem('simp_pos', JSON.stringify(purchaseOrders));
}

function switchPage(pageId, element) {
    document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
    document.getElementById('section-' + pageId).style.display = 'block';

    document.querySelectorAll('.menu-link').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    const titleEl = document.getElementById('page-title');
    const descEl = document.getElementById('page-desc');

    if (pageId === 'dashboard') {
        titleEl.innerText = "Dashboard Manajemen Persediaan";
        descEl.innerText = "Sistem Informasi Pengendalian Bahan Baku Konveksi Berbasis Web";
        renderDashboard();
    } else if (pageId === 'inventory') {
        titleEl.innerText = "Master Data Stok & Harga Pasar Kain";
        descEl.innerText = "Pengelolaan direktori material dan estimasi harga beli pasaran";
        renderInventoryTable();
    } else if (pageId === 'mutations') {
        titleEl.innerText = "Mutasi Stok Kain Masuk & Keluar";
        descEl.innerText = "Pencatatan real-time arus keluar masuk bahan baku produksi";
        renderMutationTable();
        updateDropdowns();
    } else if (pageId === 'procurement') {
        titleEl.innerText = "Manajemen Purchase Order (PO) & Estimasi Biaya";
        descEl.innerText = "Pemesanan otomatis material kain dengan kalkulasi estimasi anggaran";
        renderPOTable();
        updateDropdowns();
    } else if (pageId === 'hpp') {
        titleEl.innerText = "Kalkulator HPP Produk Konveksi";
        descEl.innerText = "Simulasi perhitungan Harga Pokok Produksi berdasarkan material, jahit, bordir, zipper, dan operasional";
        updateDropdowns();
        calculateHPP();
    }
}

function refreshAllViews() {
    renderDashboard();
    renderInventoryTable();
    renderMutationTable();
    renderPOTable();
    updateDropdowns();
    calculateHPP();
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
}

// 1. Dashboard
function renderDashboard() {
    const tbody = document.getElementById("dash-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    let alertCount = 0;
    let totalAssetValue = 0;

    inventoryData.forEach(item => {
        totalAssetValue += (item.price * item.stock);
        let isReorder = item.stock < item.reorder;
        if (isReorder) {
            alertCount++;
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:700;">${item.code}</td>
                    <td>${item.name}</td>
                    <td>${formatRupiah(item.price)} / ${item.unit}</td>
                    <td style="color:var(--danger); font-weight:700;">${item.stock} ${item.unit}</td>
                    <td>${item.reorder} ${item.unit}</td>
                    <td><span class="badge warning"><i class="fa-solid fa-clock"></i> Segera Pesan</span></td>
                </tr>
            `;
        }
    });

    if (alertCount === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--success); font-weight:600; padding:20px;"><i class="fa-solid fa-check-circle"></i> Semua stok material kain berada dalam batas aman.</td></tr>`;
    }

    document.getElementById("dash-total-items").innerText = inventoryData.length;
    document.getElementById("dash-alert-count").innerText = alertCount;
    document.getElementById("dash-total-asset").innerText = formatRupiah(totalAssetValue);
}

// 2. Master Inventory & Harga
function renderInventoryTable() {
    const tbody = document.getElementById("inventory-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    inventoryData.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td style="font-weight:700;">${item.code}</td>
                <td>${item.name}</td>
                <td style="font-weight:600; color:var(--primary);">${formatRupiah(item.price)} / ${item.unit}</td>
                <td>${item.stock} ${item.unit}</td>
                <td>${item.reorder} ${item.unit}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${index})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function addNewInventoryItem() {
    let code = document.getElementById("inv-code").value.trim();
    let name = document.getElementById("inv-name").value.trim();
    let price = parseInt(document.getElementById("inv-price").value);
    let stock = parseInt(document.getElementById("inv-stock").value);
    let reorder = parseInt(document.getElementById("inv-reorder").value);

    if (!code || !name || isNaN(price) || isNaN(stock) || isNaN(reorder)) {
        showToast("Lengkapi semua kolom formulir dengan benar!");
        return;
    }

    inventoryData.push({ code, name, price, stock, reorder, unit: "Unit", yieldPcs: 1 });
    saveState();
    refreshAllViews();

    document.getElementById("inv-code").value = "";
    document.getElementById("inv-name").value = "";
    document.getElementById("inv-price").value = "";
    document.getElementById("inv-stock").value = "";
    document.getElementById("inv-reorder").value = "";
    showToast("Master data kain baru berhasil disimpan!");
}

function deleteInventoryItem(index) {
    inventoryData.splice(index, 1);
    saveState();
    refreshAllViews();
    showToast("Data berhasil dihapus.");
}

// 3. Mutasi
function updateDropdowns() {
    const mutSelect = document.getElementById("mut-item");
    const poSelect = document.getElementById("po-item");
    const hppSelect = document.getElementById("hpp-item");
    
    if (mutSelect) {
        mutSelect.innerHTML = "";
        inventoryData.forEach(item => { mutSelect.innerHTML += `<option value="${item.name}">${item.name} (Stok: ${item.stock} ${item.unit})</option>`; });
    }
    if (poSelect) {
        poSelect.innerHTML = "";
        inventoryData.forEach(item => { poSelect.innerHTML += `<option value="${item.name}">${item.name} (${formatRupiah(item.price)}/${item.unit})</option>`; });
    }
    if (hppSelect) {
        hppSelect.innerHTML = "";
        inventoryData.forEach(item => { hppSelect.innerHTML += `<option value="${item.name}">${item.name} (${formatRupiah(item.price)}/${item.unit})</option>`; });
    }
}

function processMutation() {
    let itemName = document.getElementById("mut-item").value;
    let type = document.getElementById("mut-type").value;
    let qty = parseInt(document.getElementById("mut-qty").value);
    let note = document.getElementById("mut-note").value.trim() || "-";

    if (isNaN(qty) || qty <= 0) {
        showToast("Masukkan kuantitas yang valid!");
        return;
    }

    let item = inventoryData.find(i => i.name === itemName);
    if (!item) return;

    if (type === "MASUK") { item.stock += qty; }
    else {
        if (item.stock < qty) { showToast("Stok gudang tidak mencukupi!"); return; }
        item.stock -= qty;
    }

    let timeNow = new Date().toISOString().slice(0, 16).replace('T', ' ');
    mutationHistory.unshift({ time: timeNow, name: itemName, type: type, qty: qty, note: note });

    saveState();
    refreshAllViews();
    document.getElementById("mut-qty").value = "";
    document.getElementById("mut-note").value = "";
    showToast(`Mutasi stok ${type.toLowerCase()} berhasil dicatat!`);
}

function renderMutationTable() {
    const tbody = document.getElementById("mutation-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    mutationHistory.forEach(mut => {
        let badge = mut.type === "MASUK" ? '<span class="badge safe">MASUK</span>' : '<span class="badge warning">KELUAR</span>';
        let itemObj = inventoryData.find(i => i.name === mut.name);
        let unitLabel = itemObj ? itemObj.unit : 'Unit';
        tbody.innerHTML += `<tr><td>${mut.time}</td><td style="font-weight:600;">${mut.name}</td><td>${badge}</td><td style="font-weight:700;">${mut.qty} ${unitLabel}</td><td>${mut.note}</td></tr>`;
    });
}

// 4. Purchase Order
function createPO() {
    let supplier = document.getElementById("po-supplier").value;
    let itemName = document.getElementById("po-item").value;
    let qty = parseInt(document.getElementById("po-qty").value);

    if (isNaN(qty) || qty <= 0) {
        showToast("Masukkan jumlah pesanan PO yang valid!");
        return;
    }

    let item = inventoryData.find(i => i.name === itemName);
    let estCost = item ? (item.price * qty) : 0;

    let poId = "PO-" + Math.floor(100 + Math.random() * 900);
    purchaseOrders.push({ id: poId, supplier: supplier, itemName: itemName, qty: qty, cost: estCost, status: "Diproses Supplier" });

    saveState();
    refreshAllViews();
    document.getElementById("po-qty").value = "";
    showToast(`PO (${poId}) diterbitkan! Estimasi biaya: ${formatRupiah(estCost)}`);
}

function renderPOTable() {
    const tbody = document.getElementById("po-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    purchaseOrders.forEach((po, index) => {
        let itemObj = inventoryData.find(i => i.name === po.itemName);
        let unitLabel = itemObj ? itemObj.unit : 'Unit';
        tbody.innerHTML += `
            <tr>
                <td style="font-weight:700;">${po.id}</td>
                <td>${po.supplier}</td>
                <td>${po.itemName}</td>
                <td style="font-weight:700;">${po.qty} ${unitLabel}</td>
                <td style="font-weight:700; color:var(--primary);">${formatRupiah(po.cost)}</td>
                <td><span class="badge info">${po.status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="receivePO(${index})"><i class="fa-solid fa-check"></i> Terima</button>
                </td>
            </tr>
        `;
    });
}

function receivePO(index) {
    let po = purchaseOrders[index];
    let item = inventoryData.find(i => i.name === po.itemName);

    if (item) {
        item.stock += po.qty;
        let timeNow = new Date().toISOString().slice(0, 16).replace('T', ' ');
        mutationHistory.unshift({ time: timeNow, name: po.itemName, type: "MASUK", qty: po.qty, note: `Penerimaan PO (${po.id}) dari ${po.supplier}` });
    }

    purchaseOrders.splice(index, 1);
    saveState();
    refreshAllViews();
    showToast("PO diterima! Stok kain bertambah otomatis.");
}

// 5. Kalkulator HPP Produk (Kain x Jumlah Kebutuhan + Jasa + Bordir/Sablon + Zipper + Operasional)
function calculateHPP() {
    let itemName = document.getElementById("hpp-item").value;
    let usageQty = parseFloat(document.getElementById("hpp-usage").value) || 0;
    let jasaCost = parseFloat(document.getElementById("hpp-jasa").value) || 0;
    let bordirCost = parseFloat(document.getElementById("hpp-bordir").value) || 0;
    let zipperCost = parseFloat(document.getElementById("hpp-zipper").value) || 0;
    let opCost = parseFloat(document.getElementById("hpp-operasional").value) || 0;

    let item = inventoryData.find(i => i.name === itemName);
    if (!item) return;

    let totalMaterialCost = item.price * usageQty;
    let finalHPP = totalMaterialCost + jasaCost + bordirCost + zipperCost + opCost;

    document.getElementById("hpp-result").innerText = formatRupiah(finalHPP);
    document.getElementById("hpp-breakdown").innerText = 
        `Kain (${usageQty} x ${formatRupiah(item.price)} = ${formatRupiah(totalMaterialCost)}) + Jahit (${formatRupiah(jasaCost)}) + Bordir/Sablon (${formatRupiah(bordirCost)}) + Zipper (${formatRupiah(zipperCost)}) + Operasional (${formatRupiah(opCost)})`;
}

function filterDashboardTable() {
    let input = document.getElementById('dash-search').value.toLowerCase();
    let rows = document.getElementById('dash-table-body').getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        let text = rows[i].innerText.toLowerCase();
        rows[i].style.display = text.indexOf(input) > -1 ? "" : "none";
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// Membuka Modal Rincian Berdasarkan Kartu yang Diklik
function openDashboardModal(type) {
    const modal = document.getElementById("dashboard-modal");
    const modalTitle = document.getElementById("modal-title");
    const tbody = document.getElementById("modal-table-body");
    tbody.innerHTML = "";

    if (type === 'all') {
        modalTitle.innerText = "Rincian Keseluruhan Master Jenis Material";
        inventoryData.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:700;">${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.stock} ${item.unit}</td>
                    <td>${formatRupiah(item.price)}</td>
                    <td><span class="badge info">Aktif</span></td>
                </tr>
            `;
        });
    } else if (type === 'alert') {
        modalTitle.innerText = "Rincian Material di Bawah Batas Reorder Point (Perlu Pesan)";
        let alertItems = inventoryData.filter(i => i.stock < i.reorder);
        if (alertItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--success); font-weight:600;">Tidak ada material di bawah batas aman.</td></tr>`;
        } else {
            alertItems.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:700;">${item.code}</td>
                        <td>${item.name}</td>
                        <td style="color:var(--danger); font-weight:700;">${item.stock} ${item.unit}</td>
                        <td>Target ROP: ${item.reorder} ${item.unit}</td>
                        <td><span class="badge warning">Segera Pesan</span></td>
                    </tr>
                `;
            });
        }
    } else if (type === 'asset') {
        modalTitle.innerText = "Rincian Estimasi Nilai Aset Gudang per Material";
        inventoryData.forEach(item => {
            let assetVal = item.price * item.stock;
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:700;">${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.stock} ${item.unit}</td>
                    <td>${formatRupiah(item.price)}</td>
                    <td style="font-weight:700; color:var(--primary);">${formatRupiah(assetVal)}</td>
                </tr>
            `;
        });
    }

    modal.style.display = "flex";
}

// Menutup Modal Rincian
function closeDashboardModal() {
    document.getElementById("dashboard-modal").style.display = "none";
}
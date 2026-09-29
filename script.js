// Data Awal Inventaris
let inventoryData = [
    { code: "BB-001", name: "Kain Katun Combed 30s", stock: 45, reorder: 50, unit: "Rol" },
    { code: "BB-002", name: "Kain Fleece Cotton", stock: 120, reorder: 40, unit: "Rol" },
    { code: "BB-003", name: "Benang Jahit Polyester", stock: 15, reorder: 20, unit: "Box" },
    { code: "BB-004", name: "Kancing Plastik 24L", stock: 300, reorder: 100, unit: "Gross" }
];

document.addEventListener("DOMContentLoaded", () => {
    renderTable();
});

// Fungsi Interaktif Klik Menu Sidebar
function switchPage(pageId, element) {
    // Sembunyikan semua section halaman
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.style.display = 'none');

    // Tampilkan halaman yang dipilih
    document.getElementById('section-' + pageId).style.display = 'block';

    // Perbarui kelas aktif pada menu sidebar
    const menuItems = document.querySelectorAll('.menu-link');
    menuItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // Ubah Judul Header sesuai halaman
    const titleEl = document.getElementById('page-title');
    const descEl = document.getElementById('page-desc');

    if (pageId === 'dashboard') {
        titleEl.innerText = "Dashboard Sistem Informasi Manajemen Persediaan";
        descEl.innerText = "Optimalisasi Adopsi SIMP Berbasis Web Guna Mencegah Keterlambatan Pengadaan";
    } else if (pageId === 'materials') {
        titleEl.innerText = "Direktori Data Bahan Baku";
        descEl.innerText = "Manajemen master data material untuk produksi konveksi";
        renderMaterialsPage();
    } else if (pageId === 'procurement') {
        titleEl.innerText = "Manajemen Pengadaan & Purchase Order (PO)";
        descEl.innerText = "Pengelolaan otomatis daftar barang yang memerlukan pemesanan ulang (*reorder*)";
        renderProcurementPage();
    } else if (pageId === 'settings') {
        titleEl.innerText = "Pengaturan Sistem SIMP";
        descEl.innerText = "Konfigurasi sistem informasi dan manajemen hak akses pengguna";
    }
}

// Fungsi merender ulang tabel utama
function renderTable() {
    const tbody = document.getElementById("inventory-table-body");
    tbody.innerHTML = "";
    
    let alertCount = 0;

    inventoryData.forEach((item, index) => {
        let isReorder = item.stock < item.reorder;
        if (isReorder) alertCount++;

        let badgeClass = isReorder ? "badge warning" : "badge safe";
        let badgeText = isReorder ? '<i class="fa-solid fa-clock"></i> Segera Pesan' : '<i class="fa-solid fa-check"></i> Aman';
        let stockColor = isReorder ? "var(--danger)" : "var(--success)";

        let row = `
            <tr>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td><span style="font-weight: 700; color: ${stockColor};">${item.stock}</span> ${item.unit}</td>
                <td>${item.reorder} ${item.unit}</td>
                <td><span class="${badgeClass}">${badgeText}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="adjustStock(${index}, 10)"><i class="fa-solid fa-plus"></i> Tambah</button>
                    <button class="btn btn-sm btn-danger" onclick="adjustStock(${index}, -10)"><i class="fa-solid fa-minus"></i> Kurang</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById("total-items").innerText = inventoryData.length + " Jenis";
    document.getElementById("alert-count").innerText = alertCount + " Item";
}

// Render data untuk halaman "Data Bahan Baku"
function renderMaterialsPage() {
    const container = document.getElementById("materials-list-container");
    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:#f8fafc; text-align:left;">
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Kode</th>
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Nama Bahan</th>
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Stok Total</th>
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Satuan</th>
                </tr>
            </thead>
            <tbody>
                ${inventoryData.map(i => `
                    <tr>
                        <td style="padding:12px; border-bottom:1px solid var(--border);">${i.code}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--border);">${i.name}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--border); font-weight:700;">${i.stock}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--border);">${i.unit}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Render data untuk halaman "Pengadaan & PO"
function renderProcurementPage() {
    const container = document.getElementById("procurement-list-container");
    const urgentItems = inventoryData.filter(i => i.stock < i.reorder);

    if (urgentItems.length === 0) {
        container.innerHTML = `<p style="color: var(--success); font-weight: 600;"><i class="fa-solid fa-check-circle"></i> Semua stok bahan baku aman. Tidak ada pengadaan darurat saat ini.</p>`;
        return;
    }

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:#fef3c7; text-align:left;">
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Kode</th>
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Nama Bahan Kurang</th>
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Stok Saat Ini</th>
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Target Reorder</th>
                    <th style="padding:12px; border-bottom:1px solid var(--border);">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${urgentItems.map(i => `
                    <tr>
                        <td style="padding:12px; border-bottom:1px solid var(--border);">${i.code}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--border); font-weight:600;">${i.name}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--border); color:var(--danger); font-weight:700;">${i.stock}${i.unit}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--border);">${i.reorder}${i.unit}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--border);">
                            <button class="btn btn-sm" onclick="showToast('Purchase Order (PO) untuk ${i.name} berhasil diajukan!')">Buat PO Supplier</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Fungsi ubah stok
function adjustStock(index, amount) {
    inventoryData[index].stock += amount;
    if (inventoryData[index].stock < 0) inventoryData[index].stock = 0;
    renderTable();
    showToast(`Stok ${inventoryData[index].name} berhasil diperbarui!`);
}

// Fungsi tambah item baru
function addNewItem() {
    let code = document.getElementById("add-code").value.trim();
    let name = document.getElementById("add-name").value.trim();
    let stock = parseInt(document.getElementById("add-stock").value);
    let reorder = parseInt(document.getElementById("add-reorder").value);

    if (!code || !name || isNaN(stock) || isNaN(reorder)) {
        showToast("Harap isi semua kolom dengan benar!");
        return;
    }

    inventoryData.push({ code, name, stock, reorder, unit: "Unit" });
    renderTable();

    document.getElementById("add-code").value = "";
    document.getElementById("add-name").value = "";
    document.getElementById("add-stock").value = "";
    document.getElementById("add-reorder").value = "";

    showToast("Bahan baku baru berhasil ditambahkan!");
}

// Fungsi filter pencarian
function filterTable() {
    let input = document.getElementById('search-input').value.toLowerCase();
    let rows = document.getElementById('inventory-table-body').getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let nameCol = rows[i].getElementsByTagName('td')[1];
        if (nameCol) {
            let textValue = nameCol.textContent || nameCol.innerText;
            rows[i].style.display = textValue.toLowerCase().indexOf(input) > -1 ? "" : "none";
        }
    }
}

// Toast Notifikasi
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}
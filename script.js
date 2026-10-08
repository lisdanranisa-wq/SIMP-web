const defaultData = [
    // Cotton Combed 24s
    { code: "K24-HTM", name: "Cotton Combed 24s", color: "Hitam", price: 136000, stock: 25, reorder: 10, unit: "Kg", usagePerPcs: 0.25 },
    { code: "K24-PTH", name: "Cotton Combed 24s", color: "Putih", price: 136000, stock: 30, reorder: 10, unit: "Kg", usagePerPcs: 0.25 },
    { code: "K24-NVY", name: "Cotton Combed 24s", color: "Navy", price: 136000, stock: 15, reorder: 10, unit: "Kg", usagePerPcs: 0.25 },
    { code: "K24-MRN", name: "Cotton Combed 24s", color: "Maroon", price: 136000, stock: 20, reorder: 10, unit: "Kg", usagePerPcs: 0.25 },
    // Cotton Combed 30s
    { code: "K30-HTM", name: "Cotton Combed 30s", color: "Hitam", price: 138000, stock: 40, reorder: 10, unit: "Kg", usagePerPcs: 0.20 },
    { code: "K30-PTH", name: "Cotton Combed 30s", color: "Putih", price: 138000, stock: 55, reorder: 10, unit: "Kg", usagePerPcs: 0.20 },
    { code: "K30-NVY", name: "Cotton Combed 30s", color: "Navy", price: 138000, stock: 35, reorder: 10, unit: "Kg", usagePerPcs: 0.20 },
    { code: "K30-MRN", name: "Cotton Combed 30s", color: "Maroon", price: 138000, stock: 45, reorder: 10, unit: "Kg", usagePerPcs: 0.20 },
    // Fleece Cotton
    { code: "FC-HTM", name: "Fleece Cotton", color: "Hitam", price: 124500, stock: 15, reorder: 20, unit: "Kg", usagePerPcs: 0.67 },
    { code: "FC-PTH", name: "Fleece Cotton", color: "Putih", price: 124500, stock: 10, reorder: 20, unit: "Kg", usagePerPcs: 0.67 },
    { code: "FC-ABU", name: "Fleece Cotton", color: "Abu Misty", price: 124500, stock: 25, reorder: 20, unit: "Kg", usagePerPcs: 0.67 },
    { code: "FC-NVY", name: "Fleece Cotton", color: "Navy", price: 124500, stock: 20, reorder: 20, unit: "Kg", usagePerPcs: 0.67 },
    // Fleece CVC
    { code: "FCVC-HTM", name: "Fleece CVC", color: "Hitam", price: 101000, stock: 30, reorder: 15, unit: "Kg", usagePerPcs: 0.50 },
    { code: "FCVC-PTH", name: "Fleece CVC", color: "Putih", price: 101000, stock: 25, reorder: 15, unit: "Kg", usagePerPcs: 0.50 },
    { code: "FCVC-ABU", name: "Fleece CVC", color: "Abu Misty", price: 101000, stock: 40, reorder: 15, unit: "Kg", usagePerPcs: 0.50 },
    { code: "FCVC-NVY", name: "Fleece CVC", color: "Navy", price: 101000, stock: 35, reorder: 15, unit: "Kg", usagePerPcs: 0.50 },
    // Kain Unione
    { code: "UN-HTM", name: "Kain Unione", color: "Hitam", price: 28000, stock: 90, reorder: 30, unit: "Meter", usagePerPcs: 1.5 },
    { code: "UN-PTH", name: "Kain Unione", color: "Putih", price: 28000, stock: 85, reorder: 30, unit: "Meter", usagePerPcs: 1.5 },
    { code: "UN-KHK", name: "Kain Unione", color: "Khaki", price: 28000, stock: 60, reorder: 30, unit: "Meter", usagePerPcs: 1.5 },
    { code: "UN-OLV", name: "Kain Unione", color: "Olive", price: 28000, stock: 75, reorder: 30, unit: "Meter", usagePerPcs: 1.5 }
];

let inventoryData = JSON.parse(localStorage.getItem('simp_inventory'));
if (!inventoryData || inventoryData.length === 0 || !inventoryData[0].color) {
    inventoryData = defaultData;
    localStorage.setItem('simp_inventory', JSON.stringify(inventoryData));
}

let mutationHistory = JSON.parse(localStorage.getItem('simp_mutations')) || [];
let purchaseOrders = JSON.parse(localStorage.getItem('simp_pos')) || [];

document.addEventListener("DOMContentLoaded", () => { refreshAllViews(); });

function saveState() {
    localStorage.setItem('simp_inventory', JSON.stringify(inventoryData));
    localStorage.setItem('simp_mutations', JSON.stringify(mutationHistory));
    localStorage.setItem('simp_pos', JSON.stringify(purchaseOrders));
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('show');
}

function switchPage(pageId, element) {
    document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
    document.getElementById('section-' + pageId).style.display = 'block';
    document.querySelectorAll('.menu-link').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    refreshAllViews();
    if (window.innerWidth <= 768) toggleSidebar();
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
}

function getDotColor(colorName) {
    let clr = colorName.toLowerCase();
    if (clr.includes('hitam')) return '#000000';
    if (clr.includes('putih')) return '#FFFFFF';
    if (clr.includes('navy')) return '#000080';
    if (clr.includes('maroon')) return '#800000';
    if (clr.includes('abu')) return '#A9A9A9';
    if (clr.includes('khaki')) return '#F0E68C';
    if (clr.includes('olive')) return '#808000';
    return '#3B82F6';
}

function refreshAllViews() {
    renderDashboard();
    renderInventoryTable();
    renderMutationTable();
    renderPOTable();
    updateDropdowns();
}

function openDashboardModal(type) {
    const modal = document.getElementById("dashboard-modal");
    const title = document.getElementById("modal-title");
    const thead = document.getElementById("modal-table-head");
    const tbody = document.getElementById("modal-table-body");
    tbody.innerHTML = "";

    if (type === 'all') {
        title.innerText = "Rincian Semua Material & Warna";
        thead.innerHTML = "<th>Kode</th><th>Material (Warna)</th><th>Stok</th><th>Pemakaian/Pcs</th>";
        inventoryData.forEach(i => tbody.innerHTML += `<tr><td>${i.code}</td><td><span class="color-dot" style="background:${getDotColor(i.color)}"></span>${i.name} (${i.color})</td><td>${i.stock} ${i.unit}</td><td>${i.usagePerPcs} ${i.unit}</td></tr>`);
    } else if (type === 'alert') {
        title.innerText = "Material Perlu Segera PO (Di bawah ROP)";
        thead.innerHTML = "<th>Kode</th><th>Material (Warna)</th><th>Stok Tersisa</th><th>Target ROP</th>";
        let alerts = inventoryData.filter(i => i.stock <= i.reorder);
        if(alerts.length === 0) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:green;">Semua Stok Aman!</td></tr>`;
        alerts.forEach(i => tbody.innerHTML += `<tr><td>${i.code}</td><td><span class="color-dot" style="background:${getDotColor(i.color)}"></span>${i.name} (${i.color})</td><td style="color:red; font-weight:bold;">${i.stock} ${i.unit}</td><td>${i.reorder} ${i.unit}</td></tr>`);
    } else if (type === 'asset') {
        title.innerText = "Rincian Estimasi Nilai Aset Gudang";
        thead.innerHTML = "<th>Kode</th><th>Material (Warna)</th><th>Volume Stok</th><th>Total Nilai (Rp)</th>";
        inventoryData.forEach(i => {
            let val = i.price * i.stock;
            tbody.innerHTML += `<tr><td>${i.code}</td><td><span class="color-dot" style="background:${getDotColor(i.color)}"></span>${i.name} (${i.color})</td><td>${i.stock} ${i.unit}</td><td style="font-weight:bold; color:var(--info);">${formatRupiah(val)}</td></tr>`;
        });
    }
    modal.style.display = "flex";
}

function closeDashboardModal() {
    document.getElementById("dashboard-modal").style.display = "none";
}

function renderDashboard() {
    const tbody = document.getElementById("dash-table-body");
    tbody.innerHTML = "";
    let alertCount = 0; let totalAsset = 0;

    inventoryData.forEach(item => {
        totalAsset += (item.price * item.stock);
        let status = item.stock <= item.reorder ? `<span class="badge warning">Kritis / Pesan PO</span>` : `<span class="badge safe">Stok Aman</span>`;
        if (item.stock <= item.reorder) alertCount++;
        tbody.innerHTML += `<tr>
            <td style="font-weight:700;">${item.code}</td>
            <td><span class="color-dot" style="background:${getDotColor(item.color)}"></span>${item.name} (${item.color})</td>
            <td style="font-weight:700;">${item.stock} ${item.unit}</td>
            <td>${status}</td>
        </tr>`;
    });

    document.getElementById("dash-total-items").innerText = inventoryData.length;
    document.getElementById("dash-alert-count").innerText = alertCount;
    document.getElementById("dash-total-asset").innerText = formatRupiah(totalAsset);
    document.getElementById("dash-po-tracking").innerText = purchaseOrders.filter(p => p.status !== "Diterima (Selesai)").length;
}

function filterDashboardTable() {
    let input = document.getElementById('dash-search').value.toLowerCase();
    let tr = document.getElementById('dash-table-body').getElementsByTagName('tr');
    for (let i = 0; i < tr.length; i++) {
        let tdKode = tr[i].getElementsByTagName('td')[0];
        let tdNama = tr[i].getElementsByTagName('td')[1]; 
        if (tdKode || tdNama) {
            let textKode = tdKode.textContent || tdKode.innerText;
            let textNama = tdNama.textContent || tdNama.innerText;
            if (textKode.toLowerCase().indexOf(input) > -1 || textNama.toLowerCase().indexOf(input) > -1) tr[i].style.display = ""; 
            else tr[i].style.display = "none"; 
        }
    }
}

function renderInventoryTable() {
    const tbody = document.getElementById("inventory-table-body");
    tbody.innerHTML = "";
    inventoryData.forEach(item => {
        tbody.innerHTML += `<tr>
            <td style="font-weight:700;">${item.code}</td>
            <td>${item.name}</td>
            <td><span class="color-dot" style="background:${getDotColor(item.color)}"></span>${item.color}</td>
            <td>${formatRupiah(item.price)}/${item.unit}</td>
            <td>${item.usagePerPcs} ${item.unit}</td>
            <td style="font-weight:700;">${item.stock} ${item.unit}</td>
        </tr>`;
    });
}

function addNewInventoryItem() {
    let code = document.getElementById("inv-code").value.trim();
    let name = document.getElementById("inv-name").value.trim();
    let color = document.getElementById("inv-color").value.trim() || "-";
    let price = parseFloat(document.getElementById("inv-price").value);
    let unit = document.getElementById("inv-unit").value.trim() || "Unit";
    let usage = parseFloat(document.getElementById("inv-usage").value) || 1;

    if (!code || !name || isNaN(price)) return showToast("Lengkapi form master data (Kode, Nama, Harga)!");
    if (inventoryData.find(i => i.code === code)) return showToast("Gagal! Kode Item sudah digunakan.");
    
    inventoryData.push({ code, name, color, price, stock: 0, reorder: 10, unit, usagePerPcs: usage });
    saveState();
    refreshAllViews();
    
    document.getElementById("inv-code").value = "";
    document.getElementById("inv-name").value = "";
    document.getElementById("inv-color").value = "";
    document.getElementById("inv-price").value = "";
    document.getElementById("inv-unit").value = "";
    document.getElementById("inv-usage").value = "";
    
    showToast("Material baru ditambahkan!");
}

function processMutation() {
    let code = document.getElementById("mut-item").value;
    let type = document.getElementById("mut-type").value;
    let qty = parseFloat(document.getElementById("mut-qty").value);
    let note = document.getElementById("mut-note").value || "-";

    let item = inventoryData.find(i => i.code === code);
    if (!item || isNaN(qty) || qty <= 0) return showToast("Input tidak valid!");

    if (type === "KELUAR") {
        if (item.stock < qty) return showToast("Gagal: Stok tidak cukup!");
        item.stock -= qty;
    } else {
        item.stock += qty;
    }

    mutationHistory.unshift({ time: new Date().toLocaleString('id-ID'), code: item.code, itemName: `${item.name} (${item.color})`, type: type, qty: qty, note: note });
    saveState();
    refreshAllViews();
    document.getElementById("mut-qty").value = "";
    document.getElementById("mut-note").value = "";
    showToast("Mutasi berhasil dicatat!");
}

function renderMutationTable() {
    const tbody = document.getElementById("mutation-table-body");
    tbody.innerHTML = "";
    mutationHistory.forEach(mut => {
        let badge = mut.type === "KELUAR" ? `<span class="badge warning">PRODUKSI (-)</span>` : `<span class="badge safe">MASUK (+)</span>`;
        tbody.innerHTML += `<tr><td>${mut.time}</td><td style="font-weight:700;">${mut.itemName}</td><td>${badge}</td><td>${mut.qty}</td><td>${mut.note}</td></tr>`;
    });
}

function createPO() {
    let supplier = document.getElementById("po-supplier").value.trim();
    let phone = document.getElementById("po-phone").value.trim();
    let code = document.getElementById("po-item").value;
    let qty = parseFloat(document.getElementById("po-qty").value);

    if (!supplier || !phone || isNaN(qty) || qty <= 0) return showToast("Lengkapi form PO!");

    let item = inventoryData.find(i => i.code === code);
    let totalBayar = item.price * qty;
    let poId = "PO-" + Math.floor(1000 + Math.random() * 9000);

    purchaseOrders.push({ id: poId, supplier, phone, code: item.code, itemName: `${item.name} (${item.color})`, qty, cost: totalBayar, statusCode: 1, status: "Menunggu Konfirmasi" });

    saveState();
    refreshAllViews();
    document.getElementById("po-qty").value = "";
    showToast(`PO diterbitkan! Total tagihan: ${formatRupiah(totalBayar)}`);
}

function renderPOTable() {
    const tbody = document.getElementById("po-table-body");
    tbody.innerHTML = "";
    purchaseOrders.forEach((po, idx) => {
        let btnHTML = po.statusCode === 1 ? `<button class="btn btn-sm btn-outline" onclick="updatePOStatus(${idx}, 2)"><i class="fa-solid fa-truck"></i> Dikirim</button>` 
                    : po.statusCode === 2 ? `<button class="btn btn-sm btn-success" onclick="updatePOStatus(${idx}, 3)"><i class="fa-solid fa-check-double"></i> Terima</button>` 
                    : `<span class="text-light" style="font-size:0.8rem;"><i class="fa-solid fa-lock"></i> Selesai</span>`;

        tbody.innerHTML += `<tr>
            <td style="font-weight:700;">${po.id}</td>
            <td><strong>${po.supplier}</strong><br><span style="font-size:0.8rem; color:#6B7280;">${po.phone}</span></td>
            <td>${po.qty} - ${po.itemName}</td>
            <td style="font-weight:700; color:var(--navy-doff);">${formatRupiah(po.cost)}</td>
            <td><span class="badge tracking-${po.statusCode}">${po.status}</span></td>
            <td>${btnHTML}</td>
        </tr>`;
    });
}

function updatePOStatus(index, newStatusCode) {
    let po = purchaseOrders[index];
    if (newStatusCode === 2) {
        po.statusCode = 2; po.status = "Dikirim Supplier";
    } else if (newStatusCode === 3) {
        po.statusCode = 3; po.status = "Diterima (Selesai)";
        let item = inventoryData.find(i => i.code === po.code);
        if(item) { 
            item.stock += po.qty; 
            mutationHistory.unshift({ time: new Date().toLocaleString('id-ID'), code: po.code, itemName: po.itemName, type: "MASUK", qty: po.qty, note: `Penerimaan PO ${po.id}` }); 
        }
    }
    saveState();
    refreshAllViews();
}

function updateDropdowns() {
    const htmlOpts = inventoryData.map(i => `<option value="${i.code}">${i.name} (${i.color}) - Stok: ${i.stock} ${i.unit}</option>`).join('');
    if(document.getElementById("mut-item")) document.getElementById("mut-item").innerHTML = htmlOpts;
    if(document.getElementById("po-item")) document.getElementById("po-item").innerHTML = htmlOpts;
    if(document.getElementById("hpp-item")) document.getElementById("hpp-item").innerHTML = `<option value="" disabled selected>-- Pilih Kain & Warna --</option>` + htmlOpts;
}

function updateHPPUsage() {
    let code = document.getElementById("hpp-item").value;
    let item = inventoryData.find(i => i.code === code);
    if (item) {
        document.getElementById("hpp-usage").value = item.usagePerPcs;
        calculateHPP(); 
    }
}

function calculateHPP() {
    let code = document.getElementById("hpp-item").value;
    let item = inventoryData.find(i => i.code === code);
    if (!item) return;  

    let usage = parseFloat(document.getElementById("hpp-usage").value) || 0;
    let jasa = parseFloat(document.getElementById("hpp-jasa").value) || 0;
    let bordir = parseFloat(document.getElementById("hpp-bordir").value) || 0;
    let zip = parseFloat(document.getElementById("hpp-zipper").value) || 0;
    let op = parseFloat(document.getElementById("hpp-operasional").value) || 0;

    let kainCost = item.price * usage;
    let total = kainCost + jasa + bordir + zip + op;

    document.getElementById("hpp-result").innerText = formatRupiah(total);
    document.getElementById("hpp-breakdown").innerText = `Kain (${usage} ${item.unit} = ${formatRupiah(kainCost)}) + Jahit (${formatRupiah(jasa)}) + Aksesoris (${formatRupiah(bordir + zip)}) + Op (${formatRupiah(op)})`;
}

function showToast(msg) {
    document.getElementById("toast-message").innerText = msg;
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}
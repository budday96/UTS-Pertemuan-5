// Ganti URL endpoint API ke media
const API_URL = 'http://localhost:3000/api/media';

const mediaTableBody = document.getElementById('mediaTableBody');
const mediaModal = new bootstrap.Modal(document.getElementById('mediaModal'));
const mediaForm = document.getElementById('mediaForm');
const mediaIdInput = document.getElementById('mediaId');
const modalTitle = document.getElementById('mediaModalLabel');
const saveButton = document.getElementById('saveButton');
const alertMessage = document.getElementById('alertMessage');

// =======================================================
// === 1. READ (GET) - Mengambil Data ====================
// =======================================================
async function fetchMedia() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Gagal memuat data media: ' + response.statusText);
        }
        const media = await response.json();
        renderMedia(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        mediaTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal terhubung ke API: ${error.message}
                </td>
            </tr>
        `;
    }
}

function renderMedia(media) {
    mediaTableBody.innerHTML = '';
    if (media.length === 0) {
        mediaTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Belum ada data media.</td>
            </tr>
        `;
        return;
    }

    media.forEach(item => {
        const row = mediaTableBody.insertRow();
        row.insertCell().textContent = item.id_media;
        row.insertCell().textContent = item.judul;
        row.insertCell().textContent = item.tahun_rilis;
        row.insertCell().textContent = item.gendre;

        const actionsCell = row.insertCell();

        // Tombol Edit
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-info me-2';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => prepareEdit(item.id_media, item.judul, item.tahun_rilis, item.gendre);
        actionsCell.appendChild(editBtn);

        // Tombol Hapus
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Hapus';
        deleteBtn.onclick = () => deleteMedia(item.id_media, item.judul);
        actionsCell.appendChild(deleteBtn);
    });
}

// =======================================================
// === 2. CREATE & UPDATE (POST & PUT) ===================
// =======================================================
mediaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id_media = mediaIdInput.value;
    const judul = document.getElementById('judul').value;
    const tahun_rilis = document.getElementById('tahun_rilis').value;
    const gendre = document.getElementById('gendre').value;

    const method = id_media ? 'PUT' : 'POST';
    const url = id_media ? `${API_URL}/${id_media}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ judul, tahun_rilis, gendre })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menyimpan media.');
        }

        const actionText = id_media ? 'diperbarui' : 'ditambahkan';
        showAlert(`Media berhasil ${actionText}!`, 'success');
        mediaModal.hide();
        fetchMedia();
        mediaForm.reset();
    } catch (error) {
        console.error('Error saat menyimpan media:', error);
        showAlert(`Gagal menyimpan media: ${error.message}`, 'danger');
    }
});

// =======================================================
// === 3. PREPARE FORM (CREATE & EDIT) ===================
// =======================================================
function prepareCreate() {
    modalTitle.textContent = 'Tambah Media Baru';
    saveButton.textContent = 'Tambah';
    mediaIdInput.value = '';
    mediaForm.reset();
}

function prepareEdit(id_media, judul, tahun_rilis, gendre) {
    modalTitle.textContent = 'Edit Media';
    saveButton.textContent = 'Perbarui';
    mediaIdInput.value = id_media;
    document.getElementById('judul').value = judul;
    document.getElementById('tahun_rilis').value = tahun_rilis;
    document.getElementById('gendre').value = gendre;
    mediaModal.show();
}

// =======================================================
// === 4. DELETE (DELETE) ================================
// =======================================================
async function deleteMedia(id_media, judul) {
    if (!confirm(`Yakin ingin menghapus media: "${judul}" (ID: ${id_media})?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id_media}`, { method: 'DELETE' });

        if (response.status === 204) {
            showAlert(`Media "${judul}" berhasil dihapus.`, 'warning');
            fetchMedia();
        } else if (response.status === 404) {
            showAlert(`Media dengan ID ${id_media} tidak ditemukan.`, 'danger');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus media.');
        }
    } catch (error) {
        console.error('Error saat menghapus media:', error);
        showAlert(`Gagal menghapus media: ${error.message}`, 'danger');
    }
}

// =======================================================
// === 5. UTILITAS =======================================
// =======================================================
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.classList.remove('d-none');
    setTimeout(() => {
        alertMessage.classList.add('d-none');
    }, 3000);
}

// =======================================================
// === 6. MULAI APLIKASI ================================
// =======================================================
document.addEventListener('DOMContentLoaded', fetchMedia);

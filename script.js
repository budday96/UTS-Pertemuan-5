const API_URL = 'http://localhost:3000/api/books';
const booksTableBody = document.getElementById('booksTableBody');
const bookModal = new bootstrap.Modal(document.getElementById('bookModal'));
const bookForm = document.getElementById('bookForm');
const bookIdInput = document.getElementById('bookId');
const modalTitle = document.getElementById('bookModalLabel');
const saveButton = document.getElementById('saveButton');
const alertMessage = document.getElementById('alertMessage');

// =======================================================
// === 1. READ (GET) - Mengambil Data ====================
// =======================================================
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Gagal memuat buku: ' + response.statusText);
        }
        const books = await response.json();
        renderBooks(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        booksTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    Gagal terhubung ke API: ${error.message}
                </td>
            </tr>
        `;
    }
}

function renderBooks(books) {
    booksTableBody.innerHTML = '';
    if (books.length === 0) {
        booksTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">Belum ada data buku.</td>
            </tr>
        `;
        return;
    }
    books.forEach(book => {
        const row = booksTableBody.insertRow();
        row.insertCell().textContent = book.id;
        row.insertCell().textContent = book.title;
        row.insertCell().textContent = book.author;
        const actionsCell = row.insertCell();

        // Tombol Edit
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-info me-2';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => prepareEdit(book.id, book.title, book.author);
        actionsCell.appendChild(editBtn);

        // Tombol Hapus
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Hapus';
        deleteBtn.onclick = () => deleteBook(book.id, book.title);
        actionsCell.appendChild(deleteBtn);
    });
}

// =======================================================
// === 2. CREATE & UPDATE (POST & PUT) ===================
// =======================================================
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = bookIdInput.value;
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menyimpan buku.');
        }

        const actionText = id ? 'diperbarui' : 'ditambahkan';
        showAlert(`Buku berhasil ${actionText}!`, 'success');
        bookModal.hide();
        fetchBooks(); // Muat ulang data
        bookForm.reset();
    } catch (error) {
        console.error('Error saat menyimpan buku:', error);
        showAlert(`Gagal menyimpan buku: ${error.message}`, 'danger');
    }
});

// Fungsi untuk menyiapkan modal mode "Create"
function prepareCreate() {
    modalTitle.textContent = 'Tambah Buku Baru';
    saveButton.textContent = 'Tambah';
    bookIdInput.value = '';
    bookForm.reset();
}

// Fungsi untuk menyiapkan modal mode "Update"
function prepareEdit(id, title, author) {
    modalTitle.textContent = 'Edit Buku';
    saveButton.textContent = 'Perbarui';
    bookIdInput.value = id;
    document.getElementById('title').value = title;
    document.getElementById('author').value = author;
    bookModal.show();
}

// =======================================================
// === 3. DELETE (DELETE) ================================
// =======================================================
async function deleteBook(id, title) {
    if (!confirm(`Yakin ingin menghapus buku: "${title}" (ID: ${id})?`)) {
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.status === 204) { // Status 204: No Content (berhasil dihapus)
            showAlert(`Buku "${title}" berhasil dihapus.`, 'warning');
            fetchBooks(); // Muat ulang data
        } else if (response.status === 404) {
            showAlert(`Buku dengan ID ${id} tidak ditemukan.`, 'danger');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus buku.');
        }
    } catch (error) {
        console.error('Error saat menghapus buku:', error);
        showAlert(`Gagal menghapus buku: ${error.message}`, 'danger');
    }
}

// =======================================================
// === UTILITAS ==========================================
// =======================================================
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.classList.remove('d-none');
    // Hilangkan peringatan setelah 3 detik
    setTimeout(() => {
        alertMessage.classList.add('d-none');
    }, 3000);
}

// Panggil fungsi untuk memuat data saat halaman dimuat
document.addEventListener('DOMContentLoaded', fetchBooks);
const form = document.getElementById('inheritanceForm');
const assetValue = document.getElementById('assetValue');
const themeToggle = document.getElementById('themeToggle');
const heirsGroup = document.getElementById('heirsGroup');
const assetInput = document.getElementById('asset');

const heirs = [
    { id: 'wife', label: 'Istri', priority: 1 },
    { id: 'husband', label: 'Suami', priority: 1 },
    { id: 'father', label: 'Ayah', priority: 2 },
    { id: 'mother', label: 'Ibu', priority: 2 },
    { id: 'sonChild', label: 'Anak Laki-laki', priority: 3 },
    { id: 'daughterChild', label: 'Anak Perempuan', priority: 3 },
    { id: 'sonGrandchild', label: 'Cucu Laki-laki dari Anak Laki-laki', priority: 4 },
    { id: 'daughterGrandchild', label: 'Cucu Perempuan dari Anak Laki-laki', priority: 4 },
    { id: 'fullBrother', label: 'Saudara Laki-laki Kandung', priority: 5 },
    { id: 'fullSister', label: 'Saudara Perempuan Kandung', priority: 5 },
    { id: 'paternalBrother', label: 'Saudara Laki-laki Seayah', priority: 6 },
    { id: 'paternalSister', label: 'Saudara Perempuan Seayah', priority: 6 },
    { id: 'maternalSibling', label: 'Saudara Seibu', priority: 7 },
    { id: 'paternalUncle', label: 'Paman Kandung', priority: 8 },
    { id: 'paternalUnclesSon', label: 'Anak Laki-laki Paman Kandung', priority: 9 }
];

function createHeirCheckbox(heir, isChecked) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';
    wrapper.innerHTML = `
        <input type="checkbox" id="${heir.id}" name="heir" value="${heir.id}" ${isChecked ? 'checked' : ''}>
        <label for="${heir.id}">${heir.label}</label>
    `;
    return wrapper;
}

function updateHeirsList() {
    const deceased = document.querySelector('input[name="deceased"]:checked');
    const selectedHeirs = Array.from(document.querySelectorAll('input[name="heir"]:checked')).map(input => input.value);

    heirsGroup.innerHTML = '<label>Ahli Waris:</label>';

    if (!deceased) {
        return; // Jika tidak ada yang meninggal, tidak perlu menampilkan ahli waris
    }

    const isHusbandDeceased = deceased.value === 'husband';
    const isWifeDeceased = deceased.value === 'wife';

    heirs.forEach(heir => {
        let shouldShow = false;

        switch (heir.id) {
            case 'wife':
                shouldShow = isHusbandDeceased;
                break;
            case 'husband':
                shouldShow = isWifeDeceased;
                break;
            case 'father':
            case 'mother':
                shouldShow = true; // Orang tua selalu berhak
                break;
            case 'sonChild':
            case 'daughterChild':
                shouldShow = true; // Anak selalu berhak
                break;
            case 'sonGrandchild':
            case 'daughterGrandchild':
                shouldShow = !selectedHeirs.includes('sonChild') && !selectedHeirs.includes('daughterChild');
                break;
            case 'fullBrother':
            case 'fullSister':
            case 'paternalBrother':
            case 'paternalSister':
                shouldShow = !selectedHeirs.includes('sonChild') && 
                             !selectedHeirs.includes('daughterChild') && 
                             !selectedHeirs.includes('father');
                break;
            case 'maternalSibling':
                shouldShow = !selectedHeirs.includes('sonChild') && 
                             !selectedHeirs.includes('daughterChild') && 
                             !selectedHeirs.includes('father') &&
                             !selectedHeirs.includes('sonGrandchild');
                break;
            case 'paternalUncle':
            case 'paternalUnclesSon':
                shouldShow = !selectedHeirs.includes('sonChild') && 
                             !selectedHeirs.includes('daughterChild') && 
                             !selectedHeirs.includes('father') &&
                             !selectedHeirs.includes('sonGrandchild') &&
                             !selectedHeirs.includes('fullBrother') &&
                             !selectedHeirs.includes('paternalBrother');
                break;
        }

        if (shouldShow) {
            const isChecked = selectedHeirs.includes(heir.id);
            const checkboxWrapper = createHeirCheckbox(heir, isChecked);
            heirsGroup.appendChild(checkboxWrapper);
        }
    });
}

function formatRupiah(angka) {
    const reverse = angka.toString().split('').reverse().join('');
    let ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return `Rp ${ribuan}`;
}

assetInput.addEventListener('input', function(e) {
    let value = this.value.replace(/\D/g, '');
    this.value = formatRupiah(value);
});

form.addEventListener('change', (e) => {
    if (e.target.name === 'deceased') {
        document.querySelectorAll('input[name="deceased"]').forEach(input => {
            if (input !== e.target) input.checked = false;
        });
        assetValue.style.display = e.target.checked ? 'block' : 'none';
    }
    updateHeirsList();
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '🌓' : '🌓';
});

// Inisialisasi daftar ahli waris
updateHeirsList();
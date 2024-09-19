const form = document.getElementById('inheritanceForm');
const assetValue = document.getElementById('assetValue');
const themeToggle = document.getElementById('themeToggle');
const heirsGroup = document.getElementById('heirsGroup');
const assetInput = document.getElementById('asset');
const calculateButton = document.createElement('button');
calculateButton.id = 'calculateInheritance';
calculateButton.textContent = 'Hitung';
form.appendChild(calculateButton);

// ... (previous code for UI and form handling remains the same)

function calculateInheritance() {
    const asset = parseInt(assetInput.value.replace(/\D/g, ''));
    if (isNaN(asset) || asset <= 0) {
        Swal.fire('Error', 'Masukkan nilai aset yang valid', 'error');
        return;
    }

    const selectedHeirs = Array.from(document.querySelectorAll('input[name="heir"]:checked')).map(input => input.id);
    const shares = {};
    let remainingShare = 1; // 100% of the asset

    // Function to subtract a share from the remaining share
    const subtractShare = (share) => {
        remainingShare -= share;
        return share;
    };

    // Spouse
    if (selectedHeirs.includes('wife')) {
        shares['wife'] = subtractShare(selectedHeirs.includes('sonChild') || selectedHeirs.includes('daughterChild') || selectedHeirs.includes('sonGrandchild') || selectedHeirs.includes('daughterGrandchild') ? 1/8 : 1/4);
    }
    if (selectedHeirs.includes('husband')) {
        shares['husband'] = subtractShare(selectedHeirs.includes('sonChild') || selectedHeirs.includes('daughterChild') || selectedHeirs.includes('sonGrandchild') || selectedHeirs.includes('daughterGrandchild') ? 1/4 : 1/2);
    }

    // Parents
    if (selectedHeirs.includes('mother')) {
        const hasChildren = selectedHeirs.includes('sonChild') || selectedHeirs.includes('daughterChild') || selectedHeirs.includes('sonGrandchild') || selectedHeirs.includes('daughterGrandchild');
        const hasSiblings = selectedHeirs.includes('fullBrother') || selectedHeirs.includes('fullSister') || selectedHeirs.includes('paternalBrother') || selectedHeirs.includes('paternalSister') || selectedHeirs.includes('maternalSibling');
        shares['mother'] = subtractShare(hasChildren || hasSiblings ? 1/6 : 1/3);
    }
    if (selectedHeirs.includes('father')) {
        shares['father'] = subtractShare(1/6); // Father always gets at least 1/6
    }

    // Children and Grandchildren
    const hasChildren = selectedHeirs.includes('sonChild') || selectedHeirs.includes('daughterChild');
    const hasGrandchildren = !hasChildren && (selectedHeirs.includes('sonGrandchild') || selectedHeirs.includes('daughterGrandchild'));
    
    if (hasChildren) {
        const sons = selectedHeirs.filter(heir => heir === 'sonChild').length;
        const daughters = selectedHeirs.filter(heir => heir === 'daughterChild').length;
        const totalShares = sons * 2 + daughters;
        
        if (sons > 0) shares['sonChild'] = (remainingShare * 2 * sons) / totalShares;
        if (daughters > 0) shares['daughterChild'] = (remainingShare * daughters) / totalShares;
        
        remainingShare = 0; // Children consume all remaining shares
    } else if (hasGrandchildren) {
        const grandsons = selectedHeirs.filter(heir => heir === 'sonGrandchild').length;
        const granddaughters = selectedHeirs.filter(heir => heir === 'daughterGrandchild').length;
        const totalShares = grandsons * 2 + granddaughters;
        
        if (grandsons > 0) shares['sonGrandchild'] = (remainingShare * 2 * grandsons) / totalShares;
        if (granddaughters > 0) shares['daughterGrandchild'] = (remainingShare * granddaughters) / totalShares;
        
        remainingShare = 0; // Grandchildren consume all remaining shares
    }

    // Siblings (when there are no children, grandchildren, or father)
    if (!hasChildren && !hasGrandchildren && !selectedHeirs.includes('father')) {
        const fullBrothers = selectedHeirs.filter(heir => heir === 'fullBrother').length;
        const fullSisters = selectedHeirs.filter(heir => heir === 'fullSister').length;
        const paternalBrothers = selectedHeirs.filter(heir => heir === 'paternalBrother').length;
        const paternalSisters = selectedHeirs.filter(heir => heir === 'paternalSister').length;
        const maternalSiblings = selectedHeirs.filter(heir => heir === 'maternalSibling').length;

        // Full siblings
        if (fullBrothers > 0 || fullSisters > 0) {
            const totalShares = fullBrothers * 2 + fullSisters;
            if (fullBrothers > 0) shares['fullBrother'] = (remainingShare * 2 * fullBrothers) / totalShares;
            if (fullSisters > 0) shares['fullSister'] = (remainingShare * fullSisters) / totalShares;
            remainingShare = 0;
        }
        // Paternal siblings (if no full siblings)
        else if (paternalBrothers > 0 || paternalSisters > 0) {
            const totalShares = paternalBrothers * 2 + paternalSisters;
            if (paternalBrothers > 0) shares['paternalBrother'] = (remainingShare * 2 * paternalBrothers) / totalShares;
            if (paternalSisters > 0) shares['paternalSister'] = (remainingShare * paternalSisters) / totalShares;
            remainingShare = 0;
        }
        // Maternal siblings
        if (maternalSiblings > 0) {
            const maternalShare = maternalSiblings > 1 ? 1/3 : 1/6;
            shares['maternalSibling'] = subtractShare(maternalShare) / maternalSiblings;
        }
    }

    // Paternal uncle and cousin (when there are no closer heirs)
    if (remainingShare > 0) {
        if (selectedHeirs.includes('paternalUncle')) {
            shares['paternalUncle'] = remainingShare;
        } else if (selectedHeirs.includes('paternalUnclesSon')) {
            shares['paternalUnclesSon'] = remainingShare;
        }
    }

    // Distribute any remaining share to asabah (residuary heirs)
    if (remainingShare > 0) {
        if (selectedHeirs.includes('father')) {
            shares['father'] += remainingShare;
        } else if (selectedHeirs.includes('sonChild')) {
            shares['sonChild'] += remainingShare;
        } else if (selectedHeirs.includes('fullBrother')) {
            shares['fullBrother'] += remainingShare;
        } else if (selectedHeirs.includes('paternalBrother')) {
            shares['paternalBrother'] += remainingShare;
        }
    }

    // Display results
    let resultHTML = '<h3>Pembagian Waris:</h3><ul>';
    Object.entries(shares).forEach(([heir, share]) => {
        const amount = Math.round(asset * share);
        resultHTML += `<li>${heirs.find(h => h.id === heir).label}: ${formatRupiah(amount)} (${(share * 100).toFixed(2)}%)</li>`;
    });
    resultHTML += '</ul>';

    Swal.fire({
        title: 'Hasil Perhitungan',
        html: resultHTML,
        icon: 'info',
        width: 600,
        confirmButtonText: 'Tutup'
    });
}

calculateButton.addEventListener('click', (e) => {
    e.preventDefault();
    calculateInheritance();
});

// ... (rest of the previous code remains the same)

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
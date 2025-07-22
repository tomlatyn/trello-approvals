const STORAGE_KEY = 'approvals';

const t = TrelloPowerUp.iframe();

let elements = {};
let allMembers = [];
let selectedMembers = [];
let existingApprovals = null;
let isEditMode = false;

function showMessage(message, isError = false) {
    console.log(isError ? 'Error:' : 'Success:', message);
}

function initializePopup() {
    elements = {
        loading: document.getElementById('loading'),
        content: document.getElementById('content'),
        error: document.getElementById('error'),
        membersList: document.getElementById('members-list'),
        selectedCount: document.getElementById('selected-count'),
        createBtn: document.getElementById('create-button'),
        saveBtn: document.getElementById('save-button'),
        deleteBtn: document.getElementById('delete-button'),
        retryBtn: document.getElementById('retry-btn')
    };

    if (!elements.content || !elements.membersList) {
        console.error('Required DOM elements not found');
        return;
    }

    applyTheme();
    setupEventListeners();
    loadData();
}

function setupEventListeners() {
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', loadData);
    }
    
    if (elements.createBtn) {
        elements.createBtn.addEventListener('click', saveApprovals);
    }
    
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', saveApprovals);
    }
    
    if (elements.deleteBtn) {
        elements.deleteBtn.addEventListener('click', deleteApprovals);
    }
}

function applyTheme() {
    try {
        var context = t.getContext();
        var theme = context ? (context.theme || context.initialTheme || 'light') : 'light';
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        console.log('Applied theme:', theme);
    } catch (error) {
        console.log('Theme context not available, using light theme:', error.message);
        document.body.classList.remove('dark-mode');
    }
}

function subscribeToThemeChanges() {
    try {
        return t.subscribeToThemeChanges(function(theme) {
            console.log('Theme changed to:', theme);
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    } catch (error) {
        console.log('Theme subscription not available:', error.message);
        return null;
    }
}

function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.content.classList.add('hidden');
    elements.error.classList.add('hidden');
}

function showContent() {
    elements.loading.classList.add('hidden');
    elements.content.classList.remove('hidden');
    elements.error.classList.add('hidden');
}

function showError(message) {
    elements.loading.classList.add('hidden');
    elements.content.classList.add('hidden');
    elements.error.classList.remove('hidden');
    
    var errorMsg = elements.error.querySelector('p');
    if (errorMsg) {
        errorMsg.textContent = message || 'Unable to load board members';
    }
}

function loadData() {
    showLoading();
    
    Promise.all([
        TrelloMockUtils.api.getBoardMembers(),
        TrelloMockUtils.api.getApprovalData()
    ])
    .then(function(results) {
        allMembers = results[0];
        existingApprovals = results[1];
        
        console.log('Board members:', allMembers);
        console.log('Existing approvals:', existingApprovals);
        
        if (existingApprovals && existingApprovals.members) {
            isEditMode = true;
            selectedMembers = Object.keys(existingApprovals.members);
            showEditModeButtons();
        } else {
            isEditMode = false;
            selectedMembers = [];
            showCreateModeButtons();
        }
        
        displayMembers(allMembers);
        updateSelectedCount();
        showContent();
    })
    .catch(function(error) {
        console.error('Error loading data:', error);
        showError('Unable to load data. Please try again.');
    });
}

function showEditModeButtons() {
    elements.createBtn.classList.add('hidden');
    elements.saveBtn.classList.remove('hidden');
    elements.deleteBtn.classList.remove('hidden');
}

function showCreateModeButtons() {
    elements.createBtn.classList.remove('hidden');
    elements.saveBtn.classList.add('hidden');
    elements.deleteBtn.classList.add('hidden');
}

function displayMembers(members) {
    elements.membersList.innerHTML = '';
    
    members.sort(function(a, b) {
        var nameA = a.fullName || a.username || '';
        var nameB = b.fullName || b.username || '';
        return nameA.localeCompare(nameB);
    });
    
    members.forEach(function(member) {
        var memberItem = createMemberItem(member);
        elements.membersList.appendChild(memberItem);
    });
}

function createMemberItem(member) {
    var memberItem = document.createElement('div');
    memberItem.className = 'member-item';
    memberItem.dataset.memberId = member.id;
    
    var isSelected = selectedMembers.includes(member.id);
    if (isSelected) {
        memberItem.classList.add('selected');
    }
    
    var avatar = createAvatar(member);
    var name = createNameElement(member);
    var checkmark = isSelected ? createCheckmark() : null;
    
    memberItem.addEventListener('click', function() {
        toggleMemberSelection(member.id);
    });
    
    memberItem.appendChild(avatar);
    memberItem.appendChild(name);
    if (checkmark) {
        memberItem.appendChild(checkmark);
    }
    
    return memberItem;
}

function createAvatar(member) {
    var avatar = document.createElement('div');
    avatar.className = 'avatar';
    
    var avatarUrl = member.avatar || member.avatarUrl;
    if (avatarUrl) {
        var img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = member.fullName || member.username || 'Member';
        img.onerror = function() {
            avatar.innerHTML = '';
            avatar.textContent = getInitials(member);
        };
        avatar.appendChild(img);
    } else {
        avatar.textContent = getInitials(member);
    }
    
    return avatar;
}

function createNameElement(member) {
    var name = document.createElement('div');
    name.className = 'member-name';
    name.textContent = member.fullName || member.username || 'Unknown Member';
    return name;
}

function createCheckmark() {
    var checkmark = document.createElement('img');
    checkmark.className = 'member-checkmark';
    checkmark.src = 'icons/member-selected.svg';
    checkmark.alt = 'Selected';
    return checkmark;
}

function getInitials(member) {
    if (member.fullName) {
        var parts = member.fullName.split(' ');
        return parts.length > 1 ? 
            parts[0].charAt(0).toUpperCase() + parts[parts.length-1].charAt(0).toUpperCase() :
            parts[0].charAt(0).toUpperCase();
    } else if (member.username) {
        return member.username.charAt(0).toUpperCase();
    }
    return '?';
}

function toggleMemberSelection(memberId) {
    var index = selectedMembers.indexOf(memberId);
    var memberItem = document.querySelector('[data-member-id="' + memberId + '"]');
    
    if (index > -1) {
        selectedMembers.splice(index, 1);
        memberItem.classList.remove('selected');
        var checkmark = memberItem.querySelector('.member-checkmark');
        if (checkmark) {
            checkmark.remove();
        }
    } else {
        selectedMembers.push(memberId);
        memberItem.classList.add('selected');
        var checkmark = createCheckmark();
        memberItem.appendChild(checkmark);
    }
    
    updateSelectedCount();
}

function updateSelectedCount() {
    if (selectedMembers.length > 0) {
        elements.selectedCount.textContent = selectedMembers.length + ' member' + 
            (selectedMembers.length !== 1 ? 's' : '') + ' selected';
        elements.selectedCount.style.display = 'inline';
        elements.createBtn.disabled = false;
        elements.saveBtn.disabled = false;
    } else {
        elements.selectedCount.style.display = 'none';
        elements.createBtn.disabled = true;
        elements.saveBtn.disabled = true;
    }
}

function saveApprovals() {
    console.log('Saving approvals for members:', selectedMembers);
    
    if (selectedMembers.length === 0) {
        showMessage('Please select at least one member.', true);
        return;
    }
    
    elements.createBtn.disabled = true;
    elements.saveBtn.disabled = true;
    elements.createBtn.textContent = 'Creating...';
    elements.saveBtn.textContent = 'Saving...';
    
    var approvalData = {
        members: {},
        createdAt: existingApprovals ? existingApprovals.createdAt : new Date().toISOString(),
        createdBy: null
    };
    
    selectedMembers.forEach(function(memberId) {
        var member = allMembers.find(function(m) { return m.id === memberId; });
        
        var existingStatus = 'pending';
        var existingActionDate = null;
        
        if (existingApprovals && existingApprovals.members[memberId]) {
            existingStatus = existingApprovals.members[memberId].status;
            existingActionDate = existingApprovals.members[memberId].actionDate;
        }
        
        approvalData.members[memberId] = {
            id: memberId,
            fullName: member.fullName,
            username: member.username,
            avatarUrl: member.avatar || member.avatarUrl,
            status: existingStatus,
            actionDate: existingActionDate
        };
    });
    
    t.member('id')
    .then(function(currentMember) {
        approvalData.createdBy = existingApprovals ? existingApprovals.createdBy : currentMember.id;
        
        return t.set('card', 'shared', STORAGE_KEY, approvalData);
    })
    .then(function() {
        console.log('Approvals saved successfully');
        showMessage(isEditMode ? 'Changes saved successfully!' : 'Approvals created successfully!');
        setTimeout(function() {
            t.closePopup();
        }, 800);
    })
    .catch(function(error) {
        console.error('Error saving approvals:', error);
        showMessage('Failed to save approvals. Please try again.', true);
        resetButtonStates();
    });
}

function deleteApprovals() {
    if (!confirm('Are you sure you want to delete all approvals for this card? This action cannot be undone.')) {
        return;
    }
    
    elements.deleteBtn.disabled = true;
    elements.deleteBtn.textContent = 'Deleting...';
    
    t.remove('card', 'shared', STORAGE_KEY)
    .then(function() {
        console.log('Approvals deleted successfully');
        showMessage('Approvals deleted successfully!');
        setTimeout(function() {
            t.closePopup();
        }, 800);
    })
    .catch(function(error) {
        console.error('Error deleting approvals:', error);
        showMessage('Failed to delete approvals. Please try again.', true);
        elements.deleteBtn.disabled = false;
        elements.deleteBtn.textContent = 'Delete Approvals';
    });
}

function resetButtonStates() {
    elements.createBtn.disabled = selectedMembers.length === 0;
    elements.saveBtn.disabled = selectedMembers.length === 0;
    elements.createBtn.textContent = 'Create Approvals';
    elements.saveBtn.textContent = 'Save Changes';
}

function initialize() {
    if (window.TrelloMockUtils && window.TrelloMockUtils.isMockMode()) {
        window.TrelloMockUtils.mockTrelloIframe();
    }
    
    subscribeToThemeChanges();
    initializePopup();
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initialize, 100);
});
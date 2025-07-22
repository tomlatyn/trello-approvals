const t = TrelloPowerUp.iframe();

let elements = {};
let currentUserId = null;
let approvalData = null;

function initializeSection() {
    elements = {
        loading: document.getElementById('loading'),
        approvalContainer: document.getElementById('approval-container'),
        approvalsList: document.getElementById('approvals-list'),
        statusBannerContainer: document.getElementById('status-banner-container'),
        noApprovals: document.getElementById('no-approvals'),
        error: document.getElementById('error')
    };

    if (!elements.approvalsList || !elements.loading) {
        console.error('Required DOM elements not found');
        return;
    }

    applyTheme();
    subscribeToThemeChanges();
    loadApprovals();
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
    elements.approvalContainer.classList.add('hidden');
    elements.statusBannerContainer.innerHTML = '';
    elements.noApprovals.classList.add('hidden');
    elements.error.classList.add('hidden');
}

function showApprovals() {
    elements.loading.classList.add('hidden');
    elements.approvalContainer.classList.remove('hidden');
    elements.noApprovals.classList.add('hidden');
    elements.error.classList.add('hidden');
    resizeToContent();
}

function showNoApprovals() {
    elements.loading.classList.add('hidden');
    elements.approvalContainer.classList.add('hidden');
    elements.statusBannerContainer.innerHTML = '';
    elements.noApprovals.classList.remove('hidden');
    elements.error.classList.add('hidden');
    resizeToContent();
}

function showError() {
    elements.loading.classList.add('hidden');
    elements.approvalContainer.classList.add('hidden');
    elements.statusBannerContainer.innerHTML = '';
    elements.noApprovals.classList.add('hidden');
    elements.error.classList.remove('hidden');
}

function resizeToContent() {
    setTimeout(function() {
        var body = document.body;
        var html = document.documentElement;
        
        var height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );
        
        height += 20;
        
        t.sizeTo('body').catch(function(error) {
            console.log('Resize failed, trying alternative:', error);
            t.sizeTo('#approval-container');
        });
    }, 50);
}

function loadApprovals() {
    showLoading();
    
    console.log('🔍 Loading approvals from URL parameters');
    
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (!dataParam) {
        console.log('❌ No data parameter found in URL');
        showError();
        return;
    }
    
    try {
        approvalData = JSON.parse(decodeURIComponent(dataParam));
        console.log('📝 Parsed approval data:', approvalData);
        
        TrelloMockUtils.api.getCurrentMember()
        .then(function(currentMember) {
            console.log('📝 Current member:', currentMember);
            
            currentUserId = currentMember.id;
            
            console.log('Current user ID:', currentUserId);
            console.log('Approval data loaded:', approvalData);
            
            if (!approvalData || !approvalData.members || Object.keys(approvalData.members).length === 0) {
                console.log('No approval data found');
                showNoApprovals();
            } else {
                console.log('Displaying approvals for', Object.keys(approvalData.members).length, 'members');
                displayApprovals();
                showApprovals();
            }
        })
        .catch(function(error) {
            console.error('❌ Error loading member:', error);
            showError();
        });
    } catch (parseError) {
        console.error('❌ Error parsing approval data:', parseError);
        showError();
    }
}

function displayApprovals() {
    elements.approvalsList.innerHTML = '';
    elements.statusBannerContainer.innerHTML = '';
    
    var members = Object.values(approvalData.members);
    
    members.sort(function(a, b) {
        var nameA = (a.fullName || a.username || '').toLowerCase();
        var nameB = (b.fullName || b.username || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    members.forEach(function(member) {
        var memberDiv = createMemberElement(member);
        elements.approvalsList.appendChild(memberDiv);
    });
    
    var overallStatus = calculateOverallStatus(members);
    createStatusBanner(overallStatus);
    
    resizeToContent();
}

function createMemberElement(member) {
    var memberDiv = document.createElement('div');
    memberDiv.className = 'approval-member';
    
    var isCurrentUser = (member.id === currentUserId);
    
    if (isCurrentUser) {
        memberDiv.classList.add('current-user');
    }
    
    var leftContainer = createLeftContainer(member);
    var rightContainer = createRightContainer(member, isCurrentUser);
    
    memberDiv.appendChild(leftContainer);
    memberDiv.appendChild(rightContainer);
    
    return memberDiv;
}

function createLeftContainer(member) {
    var leftContainer = document.createElement('div');
    leftContainer.className = 'member-left-container';
    
    var avatar = createAvatar(member);
    var name = createNameElement(member);
    
    leftContainer.appendChild(avatar);
    leftContainer.appendChild(name);
    
    return leftContainer;
}

function createRightContainer(member, isCurrentUser) {
    var rightContainer = document.createElement('div');
    rightContainer.className = 'member-right-container';
    
    var statusContainer = createStatusContainer(member);
    var actionButtons = isCurrentUser ? createActionButtons(member) : createEmptyActionButtons();
    
    rightContainer.appendChild(statusContainer);
    rightContainer.appendChild(actionButtons);
    
    return rightContainer;
}

function createAvatar(member) {
    var avatar = document.createElement('div');
    avatar.className = 'avatar';
    
    if (member.avatarUrl) {
        var img = document.createElement('img');
        img.src = member.avatarUrl;
        img.alt = member.fullName || member.username;
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

function createStatusContainer(member) {
    var statusContainer = document.createElement('div');
    statusContainer.className = 'status-container';
    
    var statusSpan = document.createElement('span');
    statusSpan.className = 'approval-status status-' + member.status;
    statusSpan.textContent = member.status;
    
    statusContainer.appendChild(statusSpan);
    return statusContainer;
}

function createActionButtons(member) {
    var actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    if (member.status === 'approved') {
        actionButtons.appendChild(createButton('Reject', 'reject-btn', function() {
            updateApprovalStatus(member.id, 'rejected');
        }));
        actionButtons.appendChild(createButton('Reset', 'reset-btn', function() {
            updateApprovalStatus(member.id, 'pending');
        }));
        
    } else if (member.status === 'rejected') {
        actionButtons.appendChild(createButton('Approve', 'approve-btn', function() {
            updateApprovalStatus(member.id, 'approved');
        }));
        actionButtons.appendChild(createButton('Reset', 'reset-btn', function() {
            updateApprovalStatus(member.id, 'pending');
        }));
        
    } else {
        actionButtons.appendChild(createButton('Approve', 'approve-btn', function() {
            updateApprovalStatus(member.id, 'approved');
        }));
        actionButtons.appendChild(createButton('Reject', 'reject-btn', function() {
            updateApprovalStatus(member.id, 'rejected');
        }));
    }
    
    return actionButtons;
}

function createEmptyActionButtons() {
    var actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    return actionButtons;
}

function createButton(text, className, onClick) {
    var button = document.createElement('button');
    button.className = 'action-btn ' + className;
    
    if (className.includes('approve-btn')) {
        var icon = document.createElement('img');
        icon.className = 'btn-icon';
        icon.src = 'icons/button-approve.svg';
        icon.alt = 'Approve';
        icon.style.width = '16pt';
        icon.style.height = '16pt';
        button.appendChild(icon);
    } else if (className.includes('reject-btn')) {
        var icon = document.createElement('img');
        icon.className = 'btn-icon';
        icon.src = 'icons/button-reject.svg';
        icon.alt = 'Reject';
        icon.style.width = '16pt';
        icon.style.height = '16pt';
        button.appendChild(icon);
    }
    
    var textSpan = document.createElement('span');
    textSpan.textContent = text;
    button.appendChild(textSpan);
    
    button.addEventListener('click', onClick);
    return button;
}

function updateApprovalStatus(memberId, status) {
    console.log('Updating approval status for member:', memberId, 'to:', status);
    
    if (!approvalData || !approvalData.members || !approvalData.members[memberId]) {
        console.error('Invalid approval data or member ID:', memberId);
        console.log('Current approval data:', approvalData);
        return;
    }
    
    approvalData.members[memberId].status = status;
    approvalData.members[memberId].actionDate = new Date().toISOString();
    
    console.log('Updated approval data:', approvalData);
    
    TrelloMockUtils.api.saveApprovalData(approvalData)
    .then(function() {
        console.log('Approval status updated successfully');
        displayApprovals();
    })
    .catch(function(error) {
        console.error('Error updating approval status:', error);
        alert('Failed to update approval status. Please try again.');
        loadApprovals();
    });
}

function calculateOverallStatus(members) {
    var statusCounts = {
        pending: 0,
        approved: 0,
        rejected: 0
    };
    
    members.forEach(function(member) {
        if (statusCounts.hasOwnProperty(member.status)) {
            statusCounts[member.status]++;
        }
    });
    
    console.log('Status counts:', statusCounts);
    
    if (statusCounts.rejected > 0) {
        return 'rejected';
    } else if (statusCounts.pending > 0) {
        return 'pending';
    } else if (statusCounts.approved > 0) {
        return 'approved';
    } else {
        return 'pending';
    }
}

function createStatusBanner(status) {
    var banner = document.createElement('div');
    banner.className = 'status-banner banner-' + status;
    banner.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    elements.statusBannerContainer.appendChild(banner);
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

function initialize() {
    if (window.TrelloMockUtils && window.TrelloMockUtils.isMockMode()) {
        window.TrelloMockUtils.mockTrelloIframe();
    }
    
    initializeSection();
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initialize, 100);
});
// Mock Detection and API Abstraction Utilities
// Provides smart detection of when to use mock data and wrapper functions for API calls

window.TrelloMockUtils = {
    
    // Check if mock mode should be enabled
    isMockMode: function() {
        // Priority 1: URL parameter ?mock=true
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mock') === 'true') {
            return true;
        }

        // Priority 2: localStorage setting
        if (localStorage.getItem('trello_mock_mode') === 'true') {
            return true;
        }

        // Priority 3: Domain detection (auto-enable for development)
        var hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local')) {
            return true;
        }

        return false;
    },

    // Enable mock mode (can be called from browser console)
    enableMockMode: function() {
        localStorage.setItem('trello_mock_mode', 'true');
        console.log('✅ Mock mode enabled. Reload the page to see changes.');
        console.log('💡 Use TrelloMockUtils.disableMockMode() to disable');
    },

    // Disable mock mode (can be called from browser console)
    disableMockMode: function() {
        localStorage.removeItem('trello_mock_mode');
        console.log('✅ Mock mode disabled. Reload the page to see changes.');
    },

    // Toggle mock mode (can be called from browser console)
    toggleMockMode: function() {
        if (localStorage.getItem('trello_mock_mode') === 'true') {
            this.disableMockMode();
        } else {
            this.enableMockMode();
        }
    },

    // Log current mode status
    logModeStatus: function() {
        var isMock = this.isMockMode();
        console.log(isMock ? '🎭 Running in MOCK mode' : '🔗 Running in REAL Trello mode');
        
        if (isMock) {
            console.log('📝 Mock mode enabled by:');
            if (new URLSearchParams(window.location.search).get('mock') === 'true') {
                console.log('  • URL parameter (?mock=true)');
            }
            if (localStorage.getItem('trello_mock_mode') === 'true') {
                console.log('  • localStorage setting');
            }
            var hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local')) {
                console.log('  • Development domain (' + hostname + ')');
            }
            console.log('💡 Use TrelloMockUtils.disableMockMode() to disable');
        } else {
            console.log('💡 Use TrelloMockUtils.enableMockMode() to enable mock mode');
            console.log('💡 Or add ?mock=true to the URL');
        }
    },

    // API Wrapper Functions
    api: {
        // Get current member
        getCurrentMember: function() {
            if (TrelloMockUtils.isMockMode()) {
                console.log('🎭 [MOCK] Getting current member:', TrelloMockData.currentUserId);
                return Promise.resolve({
                    id: TrelloMockData.currentUserId,
                    fullName: TrelloMockData.getMemberById(TrelloMockData.currentUserId).fullName,
                    username: TrelloMockData.getMemberById(TrelloMockData.currentUserId).username
                });
            }
            return window.TrelloPowerUp.iframe().member('all');
        },

        // Get approval data from card
        getApprovalData: function() {
            if (TrelloMockUtils.isMockMode()) {
                console.log('🎭 [MOCK] Getting approval data');
                return Promise.resolve(TrelloMockData.existingApprovals);
            }
            return window.TrelloPowerUp.iframe().get('card', 'shared', 'approvals');
        },

        // Save approval data to card
        saveApprovalData: function(data) {
            if (TrelloMockUtils.isMockMode()) {
                console.log('🎭 [MOCK] Saving approval data:', data);
                // Update our mock data for consistency
                TrelloMockData.existingApprovals = data;
                return Promise.resolve();
            }
            return window.TrelloPowerUp.iframe().set('card', 'shared', 'approvals', data);
        },

        // Delete approval data from card
        deleteApprovalData: function() {
            if (TrelloMockUtils.isMockMode()) {
                console.log('🎭 [MOCK] Deleting approval data');
                TrelloMockData.existingApprovals = null;
                return Promise.resolve();
            }
            return window.TrelloPowerUp.iframe().remove('card', 'shared', 'approvals');
        },

        // Get board members
        getBoardMembers: function() {
            if (TrelloMockUtils.isMockMode()) {
                console.log('🎭 [MOCK] Getting board members');
                return Promise.resolve(TrelloMockData.boardMembers);
            }
            
            // Real Trello implementation (from manage-approvals.html)
            var t = window.TrelloPowerUp.iframe();
            return new Promise(function(resolve, reject) {
                t.board('all')
                .then(function(board) {
                    if (board.members && board.members.length > 0) {
                        resolve(board.members);
                        return;
                    }
                    
                    if (board.idOrganization) {
                        return t.organization('all');
                    } else {
                        return t.board('members');
                    }
                })
                .then(function(result) {
                    if (!result) return; // Already resolved above
                    
                    if (result.id && result.name && result.hasOwnProperty('members')) {
                        if (result.members && result.members.length > 0) {
                            resolve(result.members);
                            return;
                        } else {
                            return t.board('members');
                        }
                    } else {
                        var members = null;
                        
                        if (Array.isArray(result)) {
                            members = result;
                        } else if (result.members) {
                            if (result.members.members && Array.isArray(result.members.members)) {
                                members = result.members.members;
                            } else if (Array.isArray(result.members)) {
                                members = result.members;
                            }
                        }
                        
                        if (members && members.length > 0) {
                            resolve(members);
                        } else {
                            throw new Error('No board members found');
                        }
                    }
                })
                .catch(function(error) {
                    reject(error);
                });
            });
        },

        // Close popup (works in both modes)
        closePopup: function() {
            if (TrelloMockUtils.isMockMode()) {
                console.log('🎭 [MOCK] Would close popup (simulated)');
                alert('✅ Operation completed! (Mock mode - popup would close in real mode)');
                return Promise.resolve();
            }
            return window.TrelloPowerUp.iframe().closePopup();
        }
    }
};

// Auto-log the current mode when the script loads
document.addEventListener('DOMContentLoaded', function() {
    TrelloMockUtils.logModeStatus();
});
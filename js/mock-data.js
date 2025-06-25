// Centralized Mock Data for Trello Approvals Power-Up
// This file contains all mock/test data used during development

window.TrelloMockData = {
    // Board members data (used by manage-approvals.html)
    boardMembers: [
        {
            id: 'user123',
            fullName: 'John Doe',
            username: 'johndoe',
            avatarUrl: 'https://i.pravatar.cc/150?img=1'
        },
        {
            id: 'user456',
            fullName: 'Jane Smith',
            username: 'janesmith',
            avatarUrl: 'https://i.pravatar.cc/150?img=2'
        },
        {
            id: 'user789',
            fullName: 'Mike Johnson',
            username: 'mikej',
            avatarUrl: null // This will show initials
        },
        {
            id: 'user101',
            fullName: 'Sarah Wilson',
            username: 'sarahw',
            avatarUrl: 'https://i.pravatar.cc/150?img=3'
        },
        {
            id: 'user202',
            fullName: 'Tom Brown',
            username: 'tombrown',
            avatarUrl: 'https://i.pravatar.cc/150?img=4'
        },
        {
            id: 'user303',
            fullName: 'Lisa Davis',
            username: 'lisad',
            avatarUrl: 'https://i.pravatar.cc/150?img=5'
        },
        {
            id: 'user404',
            fullName: 'David Lee',
            username: 'davidlee',
            avatarUrl: null // This will show initials
        },
        {
            id: 'user505',
            fullName: 'Emma Taylor',
            username: 'emmat',
            avatarUrl: 'https://i.pravatar.cc/150?img=6'
        }
    ],

    // Current user ID for testing
    currentUserId: 'user123',

    // Existing approvals data (used by both files)
    existingApprovals: {
        members: {
            'user123': {
                id: 'user123',
                fullName: 'John Doe',
                username: 'johndoe',
                avatarUrl: 'https://i.pravatar.cc/150?img=1',
                status: 'pending',
                actionDate: new Date().toISOString()
            },
            'user456': {
                id: 'user456',
                fullName: 'Jane Smith',
                username: 'janesmith',
                avatarUrl: 'https://i.pravatar.cc/150?img=2',
                status: 'approved',
                actionDate: new Date().toISOString()
            },
            'user789': {
                id: 'user789',
                fullName: 'Mike Johnson',
                username: 'mikej',
                avatarUrl: null,
                status: 'rejected',
                actionDate: new Date().toISOString()
            }
        },
        createdAt: new Date().toISOString(),
        createdBy: 'user123'
    },

    // Helper function to get member by ID
    getMemberById: function(id) {
        return this.boardMembers.find(function(member) {
            return member.id === id;
        });
    },

    // Helper function to create approval data from member IDs
    createApprovalData: function(memberIds, existingData) {
        var approvalData = {
            members: {},
            createdAt: existingData ? existingData.createdAt : new Date().toISOString(),
            createdBy: existingData ? existingData.createdBy : this.currentUserId
        };

        var self = this;
        memberIds.forEach(function(memberId) {
            var member = self.getMemberById(memberId);
            if (member) {
                // Keep existing status if member was already in approvals
                var existingStatus = 'pending';
                var existingActionDate = null;
                
                if (existingData && existingData.members && existingData.members[memberId]) {
                    existingStatus = existingData.members[memberId].status;
                    existingActionDate = existingData.members[memberId].actionDate;
                }

                approvalData.members[memberId] = {
                    id: memberId,
                    fullName: member.fullName,
                    username: member.username,
                    avatarUrl: member.avatarUrl,
                    status: existingStatus,
                    actionDate: existingActionDate
                };
            }
        });

        return approvalData;
    }
};
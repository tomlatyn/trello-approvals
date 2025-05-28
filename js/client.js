TrelloPowerUp.initialize({
  'card-detail-badges': function(t, opts) {
    return [{
      title: 'Workspace Members',
      text: 'View Members',
      color: 'blue',
      callback: function(t) {
        return t.popup({
          title: 'Workspace Members',
          url: './popup.html',
          height: 400,
          width: 350
        });
      }
    }];
  },
  
  'card-buttons': function(t, opts) {
    return [{
      icon: 'https://cdn-icons-png.flaticon.com/512/681/681494.png',
      text: 'Show Members',
      callback: function(t) {
        return t.popup({
          title: 'Workspace Members',
          url: './popup.html',
          height: 400,
          width: 350
        });
      }
    }];
  }
});
/*
 * HTML5 Sortable jQuery Plugin
 * http://farhadi.ir/projects/html5sortable
 *
 * Copyright 2012, Ali Farhadi
 * Released under the MIT license.
 */
 (function($) {
  var dragging = null, placeholders = $();
  $.fn.sortable = function(options) {
    var method = String(options);
    options = $.extend({
      connectWith: false,
      namespace: '',
      items: 'li',
      handle: false
    }, options);
    return this.each(function() {
      var $this = $(this);
      if (/^enable|disable|destroy$/.test(method)) {
        var items = $this.children($this.data('items', options.items));
        var handles = $this.children($this.data('handles', options.handle ? options.handle : options.items)).attr('draggable', method == 'enable');
        if (method == 'destroy') {
          var namespacearray = ['dragstart', 'dragend', 'dragover', 'dragenter', 'drop'];
          items.add(this).removeData('connectWith items').off(namespacearray.join(options.namespace));
          handles.off('selectstart'+options.namespace);
        }
        return;
      }
      var index,
      items = $this.children(options.items),
      handles = options.handle ? items.find(options.handle) : items,
      parent,
      placeholder = $('<' + (/^ul|ol$/i.test(this.tagName) ? 'li' : options.items) + ' class="sortable-placeholder">');
      placeholders = placeholders.add(placeholder);
      if (options.connectWith) {
        $(options.connectWith).add(this).data('connectWith', options.connectWith);
      }
      // Setup drag handles
      handles.attr('draggable', 'true');
      // Handle drag events on draggable items
      items.on('dragstart'+options.namespace, function(e) {
        e.stopPropagation();
        e.originalEvent.dataTransfer.effectAllowed = 'move';
        e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
        index = (dragging = $(this)).addClass('sortable-dragging').index();
        parent = dragging.parent();
      }).on('dragend'+options.namespace, function() {
        if (!dragging) {
          return;
        }
        dragging.removeClass('sortable-dragging').show();
        placeholders.detach();
        if (index != dragging.index() || !parent.is(dragging.parent())) {
          dragging.parent().trigger('sortupdate'+options.namespace, {item: dragging});
        }
        dragging = null;
        parent = null;
      }).add([this, placeholder]).on('dragover'+options.namespace+' dragenter'+options.namespace+' drop'+options.namespace, function(e) {
        if (!items.is(dragging) && options.connectWith !== $(dragging).parent().data('connectWith')) {
          return true;
        }
        if (e.type == 'drop') {
          e.stopPropagation();
          placeholders.filter(':visible').after(dragging);
          return false;
        }
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'move';
        var $this = $(this);
        if (items.is(this)) {
          if (options.forcePlaceholderSize) {
            placeholder.height(dragging.outerHeight());
          }
          dragging.hide();
          $this[placeholder.index() < $this.index() ? 'after' : 'before'](placeholder);
          placeholders.not(placeholder).detach();
        } else if (!placeholders.is(this) && !$this.children(options.items).length) {
          placeholders.detach();
          $this.append(placeholder);
        }
        return false;
      });
});
};
})(jQuery);

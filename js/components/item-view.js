Vue.component('item-view', {
    props: ['item', 'title'],
    methods: {
        onClick: function() {
            this.item.inspected = true;
            this.$emit('clicked');
        },

        itemClasses: function() {

            if (this.item === null) {
                return;
            }

            var classes = "";

            if (this.item.inspected === false) {
                classes = "anim-new-item ";
            }

            if (this.item.rarity === "magical") {
                classes = classes + "item-rarity-magical";
            } else if (this.item.rarity === "rare") {
                classes = classes +  "item-rarity-rare";
            } else if (this.item.rarity === "epic") {
                classes = classes +  "item-rarity-epic";
            }

            return classes;
        }
    },
    template: '\
    <div :class="itemClasses()" class="item-container" v-on:click="onClick">\
        <div class="item-name">{{ title }}</div>\
        <div class="item-rarity">{{ item ? item.rarity : "-" }}</div>\
        <div class="item-level">{{ item ? "LEVEL " + item.level : "-" }}</div>\
        <div class="item-hp">{{ item && item.hp != undefined ? item.hp.toLocaleString() + " HP" : "-" }}</div>\
    </div>',
});

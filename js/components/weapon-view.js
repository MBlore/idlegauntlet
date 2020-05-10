Vue.component('weapon-view', {
    props: ['weapon'],
    methods: {
        onClick: function() {
            this.$emit('clicked');
        },
        classFromRarity: function() {

            if (this.weapon === null || this.weapon.rarity === "common") {
                return;
            }

            if (this.weapon.rarity === "magical") {
                return "item-rarity-magical";
            } else if (this.weapon.rarity === "rare") {
                return "item-rarity-rare";
            } else if (this.weapon.rarity === "epic") {
                return "item-rarity-epic";
            }
        }
    },
    template: '\
    <div :class="classFromRarity()" class="item-container" v-on:click="onClick">\
        <div class="item-name">WEAPON</div>\
        <div class="item-rarity">{{ weapon.rarity }}</div>\
        <div class="item-level">{{ "LEVEL " + weapon.level }}</div>\
        <div class="item-hp">{{ weapon.mindamage.toLocaleString() }}-{{ weapon.maxdamage.toLocaleString() }} DMG</div>\
    </div>',
});

var ItemDetailStore = {
    selectedItem: null
};

Vue.component('item-detail', {
    props: ['item'],
    data: function() {
        return ItemDetailStore;
    },
    computed: {
        getAttributesView: function() {
            var item = this.selectedItem;
            
            if (item == null || item.attributes == null || item.attributes.length === 0) {
                return [];
            }
    
            var viewData = [];
    
            item.attributes.forEach(function(a) {
                if (a.type == ItemAttributeType.MaxLife) {
                    viewData.push({ value: Math.round(a.value).toLocaleString(), label: "MAXIMUM HP"});
                } else if (a.type == ItemAttributeType.HpRegen) {
                    viewData.push({ value: (a.value * tps).toFixed(3).toLocaleString(), label: "HP REGEN/SEC"});
                } else if (a.type == ItemAttributeType.Damage) {
                    viewData.push({ value: Math.round(a.value).toLocaleString(), label: "ATTACK DAMAGE"});
                } else if (a.type == ItemAttributeType.CritChance) {
                    viewData.push({ value: a.value.toLocaleString() + "%", label: "CRITICAL HIT CHANCE"});
                } else {
                    viewData.push({ value: 0, label: "<unknown attribute>" });
                }
            });
    
            return viewData;
        },

        getArmorLabel: function() {
            if (this.selectedItem.name == "Weapon") {
                return this.selectedItem.mindamage.toLocaleString() + "-" + this.selectedItem.maxdamage.toLocaleString() + " DMG";
            } else {
                return this.selectedItem.armor != undefined ? this.selectedItem.armor.toLocaleString() + " ARMOR" : "-";
            }
        }
    },
    methods: {
        onClick: function() {
            this.$emit('clicked');
        },

        classFromRarity: function() {
            
            if (this.selectedItem === null || this.selectedItem.rarity === "common") {
                return "item-rarity-common";
            }

            if (this.selectedItem.rarity === "magical") {
                return "item-rarity-magical";
            } else if (this.selectedItem.rarity === "rare") {
                return "item-rarity-rare";
            } else if (this.selectedItem.rarity === "epic") {
                return "item-rarity-epic";
            }
        }
    },
    template: '\
    <div class="container-popup">\
        <div class="item-detail-container">\
            <div v-on:click="onClick" :class="classFromRarity()" class="item-detail-popup">\
                <div class="item-name">{{ selectedItem.name }}</div>\
                <div class="item-rarity">{{ selectedItem.rarity }}</div>\
                <div class="item-level">{{ "LEVEL " + selectedItem.level }}</div>\
                <div class="item-armor">{{ getArmorLabel }}</div>\
                <div class="item-attributes-container">\
                    <div class="item-attrribute-text" v-for="line in getAttributesView">\
                        <span>+{{ line.value }}</span><span class="gray-text"> {{ line.label }}</span>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>',
});

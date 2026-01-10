/**
 * Category Registry for EU5 Inspector
 * Defines all categories, their paths, icons, and filter configurations
 */
const CategoryRegistry = {
    // =====================
    // Core Gameplay
    // =====================
    religions: {
        id: 'religions',
        name: 'Religions',
        icon: '\u2721',
        path: 'game/in_game/common/religions',
        handler: 'religions',
        filters: [
            { key: 'group', name: 'Religion Group' },
            { key: 'tags', name: 'Tags' }
        ]
    },
    cultures: {
        id: 'cultures',
        name: 'Cultures',
        icon: '\uD83C\uDFAD',
        path: 'game/in_game/common/cultures',
        handler: 'cultures',
        filters: [
            { key: 'culture_groups', name: 'Culture Group' },
            { key: 'language', name: 'Language' },
            { key: 'tags', name: 'Tags' }
        ]
    },
    languages: {
        id: 'languages',
        name: 'Languages',
        icon: '\uD83D\uDCAC',
        path: 'game/in_game/common/languages',
        handler: 'default',
        filters: []
    },

    // =====================
    // Government & Politics
    // =====================
    government_types: {
        id: 'government_types',
        name: 'Govts',
        icon: '\uD83D\uDC51',
        path: 'game/in_game/common/government_types',
        handler: 'default',
        filters: []
    },
    laws: {
        id: 'laws',
        name: 'Laws',
        icon: '\u2696',
        path: 'game/in_game/common/laws',
        handler: 'laws',
        filters: [
            { key: 'law_category', name: 'Category' },
            { key: 'law_gov_group', name: 'Government Type' }
        ]
    },
    estates: {
        id: 'estates',
        name: 'Estates',
        icon: '\uD83C\uDFDB',
        path: 'game/in_game/common/estates',
        handler: 'default',
        filters: []
    },
    heirs_selections: {
        id: 'heirs_selections',
        name: 'Succession',
        icon: '\uD83D\uDC6A',
        path: 'game/in_game/common/heir_selections',
        handler: 'heir-selections',
        filters: [
            { key: 'use_election', name: 'Election Type' }
        ]
    },

    // =====================
    // Economy & Buildings
    // =====================
    buildings: {
        id: 'buildings',
        name: 'Buildings',
        icon: '\uD83C\uDFD7',
        path: 'game/in_game/common/building_types',
        handler: 'buildings',
        filters: [
            { key: 'category', name: 'Building Category' },
            { key: 'pop_type', name: 'Worker Type' }
        ]
    },
    goods: {
        id: 'goods',
        name: 'Goods',
        icon: '\uD83D\uDCE6',
        path: 'game/in_game/common/goods',
        handler: 'goods',
        filters: [
            { key: 'category', name: 'Goods Category' }
        ]
    },
    pop_types: {
        id: 'pop_types',
        name: 'Pops',
        icon: '\uD83D\uDC65',
        path: 'game/in_game/common/pop_types',
        handler: 'default',
        filters: []
    },
    institutions: {
        id: 'institutions',
        name: 'Institutions',
        icon: '\uD83C\uDF93',
        path: 'game/in_game/common/institution',
        handler: 'institutions',
        filters: [
            { key: 'age', name: 'Age' }
        ]
    },

    // =====================
    // Military & Diplomacy
    // =====================
    unit_types: {
        id: 'unit_types',
        name: 'Units',
        icon: '\u2694',
        path: 'game/in_game/common/unit_types',
        handler: 'unit-types',
        filters: [
            { key: 'category', name: 'Unit Category' },
            { key: 'type', name: 'Unit Type' }
        ]
    },
    casus_belli: {
        id: 'casus_belli',
        name: 'CBs',
        icon: '\u2620',
        path: 'game/in_game/common/casus_belli',
        handler: 'casus-belli',
        filters: [
            { key: 'war_goal_type', name: 'War Goal Type' }
        ]
    },
    subject_types: {
        id: 'subject_types',
        name: 'Subjects',
        icon: '\uD83E\uDD1D',
        path: 'game/in_game/common/subject_types',
        handler: 'subject-types',
        filters: [
            { key: 'level', name: 'Level' }
        ]
    },
    international_organizations: {
        id: 'international_organizations',
        name: 'Orgs',
        icon: '\uD83C\uDF10',
        path: 'game/in_game/common/international_organizations',
        handler: 'international-orgs',
        filters: [
            { key: 'unique', name: 'Unique' },
            { key: 'has_parliament', name: 'Has Parliament' }
        ]
    },

    // =====================
    // Modifiers & Scripting
    // =====================
    modifier_types: {
        id: 'modifier_types',
        name: 'Modifiers',
        icon: '\u2699',
        path: 'game/main_menu/common/modifier_type_definitions',
        handler: 'modifier-types',
        filters: [
            { key: 'category', name: 'Category' },
            { key: 'color', name: 'Effect Type' },
            { key: 'value_type', name: 'Value Type' }
        ]
    },
    static_modifiers: {
        id: 'static_modifiers',
        name: 'Static Mods',
        icon: '\uD83D\uDCCA',
        path: 'game/main_menu/common/static_modifiers',
        handler: 'static-modifiers',
        filters: [
            { key: 'category', name: 'Scope' },
            { key: '_sourceFile', name: 'Source' }
        ]
    },

    // =====================
    // Characters & Misc
    // =====================
    traits: {
        id: 'traits',
        name: 'Traits',
        icon: '\u2B50',
        path: 'game/in_game/common/traits',
        handler: 'traits',
        filters: [
            { key: 'type', name: 'Trait Type' }
        ]
    },
    events: {
        id: 'events',
        name: 'Events',
        icon: '\uD83D\uDCDC',
        path: 'game/in_game/events',
        handler: 'events',
        filters: [
            { key: 'type', name: 'Event Type' },
            { key: '_sourceFile', name: 'Source File' }
        ]
    },
    // Advances disabled - handler kept for future use
    // advances: {
    //     id: 'advances',
    //     name: 'Advances',
    //     icon: '\uD83D\uDCDA',
    //     path: 'game/in_game/common/advances',
    //     handler: 'advances',
    //     filters: [
    //         { key: 'category', name: 'Advance Category' },
    //         { key: 'era', name: 'Era' }
    //     ]
    // },
    disasters: {
        id: 'disasters',
        name: 'Disasters',
        icon: '\u26A0',
        path: 'game/in_game/common/disasters',
        handler: 'default',
        filters: []
    },
    formable_countries: {
        id: 'formable_countries',
        name: 'Formables',
        icon: '\uD83D\uDDFA',
        path: 'game/in_game/common/formable_countries',
        handler: 'formable-countries',
        filters: [
            { key: 'level', name: 'Level' },
            { key: 'rule', name: 'Rule Type' }
        ]
    }
};

/**
 * Get category by ID
 */
CategoryRegistry.get = function(id) {
    return this[id] || null;
};

/**
 * Get all categories as an array (for rendering navigation)
 */
CategoryRegistry.getAll = function() {
    return Object.values(this).filter(v => typeof v === 'object' && v.id);
};

/**
 * Get categories grouped by type
 */
CategoryRegistry.getGrouped = function() {
    return {
        'Core Gameplay': ['religions', 'cultures', 'languages'],
        'Government & Politics': ['government_types', 'laws', 'estates', 'heirs_selections'],
        'Economy & Buildings': ['buildings', 'goods', 'pop_types', 'institutions'],
        'Military & Diplomacy': ['unit_types', 'casus_belli', 'subject_types', 'international_organizations'],
        'Modifiers & Scripting': ['modifier_types', 'static_modifiers'],
        'Characters & Misc': ['traits', 'events', 'disasters', 'formable_countries']
    };
};

// Export for use in other modules
window.CategoryRegistry = CategoryRegistry;

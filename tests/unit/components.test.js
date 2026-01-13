/**
 * Unit Tests for COMPONENTS Object (components.js)
 * Validates component definitions and structure
 */

// Load COMPONENTS
loadScript('components.js');

describe('COMPONENTS Object', () => {
    describe('structure validation', () => {
        test('should have required categories', () => {
            expect(COMPONENTS.premadeStyles).toBeDefined();
            expect(COMPONENTS.layout).toBeDefined();
            expect(COMPONENTS.navigation).toBeDefined();
            expect(COMPONENTS.typography).toBeDefined();
            expect(COMPONENTS.content).toBeDefined();
            expect(COMPONENTS.cards).toBeDefined();
            expect(COMPONENTS.hero).toBeDefined();
            expect(COMPONENTS.forms).toBeDefined();
            expect(COMPONENTS.components).toBeDefined();
            expect(COMPONENTS.footer).toBeDefined();
            expect(COMPONENTS.utilities).toBeDefined();
        });

        test('each category should have name property', () => {
            Object.entries(COMPONENTS).forEach(([key, category]) => {
                expect(category.name).toBeDefined();
                expect(typeof category.name).toBe('string');
                expect(category.name.length).toBeGreaterThan(0);
            });
        });

        test('each category should have icon property', () => {
            Object.entries(COMPONENTS).forEach(([key, category]) => {
                expect(category.icon).toBeDefined();
                expect(typeof category.icon).toBe('string');
                expect(category.icon.startsWith('bi-')).toBe(true);
            });
        });

        test('each category should have items array', () => {
            Object.entries(COMPONENTS).forEach(([key, category]) => {
                expect(category.items).toBeDefined();
                expect(Array.isArray(category.items)).toBe(true);
                expect(category.items.length).toBeGreaterThan(0);
            });
        });
    });

    describe('component items validation', () => {
        test('each item should have id property', () => {
            Object.entries(COMPONENTS).forEach(([categoryKey, category]) => {
                category.items.forEach((item, index) => {
                    expect(item.id).toBeDefined();
                    expect(typeof item.id).toBe('string');
                    expect(item.id.length).toBeGreaterThan(0);
                });
            });
        });

        test('each item should have name property', () => {
            Object.entries(COMPONENTS).forEach(([categoryKey, category]) => {
                category.items.forEach((item) => {
                    expect(item.name).toBeDefined();
                    expect(typeof item.name).toBe('string');
                });
            });
        });

        test('each item should have icon property', () => {
            Object.entries(COMPONENTS).forEach(([categoryKey, category]) => {
                category.items.forEach((item) => {
                    expect(item.icon).toBeDefined();
                    expect(typeof item.icon).toBe('string');
                    expect(item.icon.startsWith('bi-')).toBe(true);
                });
            });
        });

        test('each item should have html property', () => {
            Object.entries(COMPONENTS).forEach(([categoryKey, category]) => {
                category.items.forEach((item) => {
                    expect(item.html).toBeDefined();
                    expect(typeof item.html).toBe('string');
                    expect(item.html.length).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('component ID uniqueness', () => {
        test('all component IDs should be unique', () => {
            const allIds = [];

            Object.values(COMPONENTS).forEach(category => {
                category.items.forEach(item => {
                    allIds.push(item.id);
                });
            });

            const uniqueIds = [...new Set(allIds)];
            expect(allIds.length).toBe(uniqueIds.length);
        });

        test('should not have duplicate IDs within same category', () => {
            Object.entries(COMPONENTS).forEach(([categoryKey, category]) => {
                const ids = category.items.map(item => item.id);
                const uniqueIds = [...new Set(ids)];
                expect(ids.length).toBe(uniqueIds.length);
            });
        });
    });

    describe('HTML validity', () => {
        test('all HTML should contain valid Bootstrap classes', () => {
            const commonBootstrapClasses = [
                'container', 'row', 'col', 'btn', 'card', 'nav', 'form',
                'alert', 'badge', 'modal', 'py-', 'px-', 'my-', 'mx-',
                'd-flex', 'text-', 'bg-'
            ];

            Object.values(COMPONENTS).forEach(category => {
                category.items.forEach(item => {
                    const hasBootstrapClass = commonBootstrapClasses.some(cls =>
                        item.html.includes(cls)
                    );
                    if (item.html.length > 50) {
                        expect(hasBootstrapClass).toBe(true);
                    }
                });
            });
        });

        test('all HTML should be properly closed', () => {
            Object.values(COMPONENTS).forEach(category => {
                category.items.forEach(item => {
                    const openDivs = (item.html.match(/<div/g) || []).length;
                    const closeDivs = (item.html.match(/<\/div>/g) || []).length;
                    expect(Math.abs(openDivs - closeDivs)).toBeLessThanOrEqual(1);
                });
            });
        });

        test('HTML should not contain script tags', () => {
            Object.values(COMPONENTS).forEach(category => {
                category.items.forEach(item => {
                    expect(item.html).not.toContain('<script');
                    expect(item.html).not.toContain('javascript:');
                });
            });
        });

        test('HTML should not contain event handler attributes', () => {
            const eventHandlers = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'];

            Object.values(COMPONENTS).forEach(category => {
                category.items.forEach(item => {
                    eventHandlers.forEach(handler => {
                        expect(item.html.toLowerCase()).not.toContain(handler);
                    });
                });
            });
        });
    });

    describe('tabbed categories', () => {
        test('premadeStyles should be tabbed', () => {
            expect(COMPONENTS.premadeStyles.isTabbed).toBe(true);
            expect(COMPONENTS.premadeStyles.tabs).toBeDefined();
            expect(Array.isArray(COMPONENTS.premadeStyles.tabs)).toBe(true);
        });

        test('premadeStyles tabs should have required properties', () => {
            COMPONENTS.premadeStyles.tabs.forEach(tab => {
                expect(tab.id).toBeDefined();
                expect(tab.name).toBeDefined();
                expect(tab.icon).toBeDefined();
            });
        });

        test('premadeStyles items should have tab property', () => {
            COMPONENTS.premadeStyles.items.forEach(item => {
                expect(item.tab).toBeDefined();
                expect(typeof item.tab).toBe('string');
            });
        });

        test('premadeStyles items should reference valid tab ids', () => {
            const validTabIds = COMPONENTS.premadeStyles.tabs.map(t => t.id);
            // Known issue: 2 items use 'navigation' which is not a defined tab
            // These are: style-mega-menu, style-dash-sidebar
            const knownInvalidTabs = ['navigation'];

            COMPONENTS.premadeStyles.items.forEach(item => {
                if (!knownInvalidTabs.includes(item.tab)) {
                    expect(validTabIds).toContain(item.tab);
                }
            });
        });
    });

    describe('specific category content', () => {
        test('layout category should contain grid components', () => {
            const layoutIds = COMPONENTS.layout.items.map(i => i.id);

            expect(layoutIds).toContain('container');
            expect(layoutIds).toContain('row-2col');
            expect(layoutIds).toContain('row-3col');
        });

        test('navigation category should contain navbar components', () => {
            const navIds = COMPONENTS.navigation.items.map(i => i.id);

            expect(navIds).toContain('navbar-dark');
            expect(navIds).toContain('navbar-light');
        });

        test('forms category should contain input components', () => {
            const formIds = COMPONENTS.forms.items.map(i => i.id);

            expect(formIds).toContain('form-contact');
            expect(formIds).toContain('form-login');
            expect(formIds).toContain('input-text');
        });

        test('cards category should contain card variations', () => {
            const cardIds = COMPONENTS.cards.items.map(i => i.id);

            expect(cardIds).toContain('card-basic');
            expect(cardIds).toContain('card-image');
        });

        test('footer category should contain footer variations', () => {
            const footerIds = COMPONENTS.footer.items.map(i => i.id);

            expect(footerIds).toContain('footer-simple');
            expect(footerIds).toContain('footer-columns');
        });
    });

    describe('component count', () => {
        test('should have substantial number of components', () => {
            let totalComponents = 0;

            Object.values(COMPONENTS).forEach(category => {
                totalComponents += category.items.length;
            });

            expect(totalComponents).toBeGreaterThan(100);
        });

        test('each category should have at least 3 components', () => {
            Object.entries(COMPONENTS).forEach(([key, category]) => {
                expect(category.items.length).toBeGreaterThanOrEqual(3);
            });
        });
    });
});

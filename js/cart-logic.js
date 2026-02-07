// Script pour gérer la logique conditionnelle Destination → Association
// Quand "Pour moi" est sélectionné, le champ "Association bénéficiaire" est grisé
document.addEventListener('DOMContentLoaded', function() {
    // Observer les changements dans le panier Snipcart
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                initDestinationLogic();
            }
        });
    });

    // Observer le body pour détecter quand Snipcart charge
    observer.observe(document.body, { childList: true, subtree: true });

    function initDestinationLogic() {
        // Trouver tous les selects "Destination"
        const destinationSelects = document.querySelectorAll('select[name*="Destination"], select[data-custom-field-name="Destination"]');

        destinationSelects.forEach(function(select) {
            // Trouver le select "Association" correspondant (dans le même item)
            const itemContainer = select.closest('.snipcart-item-line, .snipcart-cart-item, [class*="item"]');
            if (!itemContainer) return;

            const associationSelect = itemContainer.querySelector('select[name*="Association"], select[data-custom-field-name*="Association"]');
            if (!associationSelect) return;

            // Fonction pour mettre à jour l'état du champ Association
            function updateAssociationState() {
                const isDonation = select.value.toLowerCase().includes('don') ||
                                   select.value.toLowerCase().includes('association');

                if (isDonation) {
                    // Activer le champ Association
                    associationSelect.disabled = false;
                    associationSelect.style.opacity = '1';
                    associationSelect.style.cursor = 'pointer';
                    associationSelect.parentElement?.classList?.remove('disabled');
                } else {
                    // Désactiver/griser le champ Association
                    associationSelect.disabled = true;
                    associationSelect.style.opacity = '0.4';
                    associationSelect.style.cursor = 'not-allowed';
                    associationSelect.value = ''; // Réinitialiser la sélection
                    associationSelect.parentElement?.classList?.add('disabled');
                }
            }

            // Appliquer l'état initial
            updateAssociationState();

            // Écouter les changements
            select.addEventListener('change', updateAssociationState);
        });
    }

    // Écouter les événements Snipcart pour réinitialiser la logique
    if (typeof Snipcart !== 'undefined') {
        Snipcart.events.on('cart.ready', initDestinationLogic);
        Snipcart.events.on('item.added', initDestinationLogic);
        Snipcart.events.on('item.updated', initDestinationLogic);
    }
});

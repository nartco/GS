const updatePanierAndBagCount = async (newItem) => {
    try {
      // Récupérer le panier actuel
      let basketData = await getPanier();
      
      // Ajouter le nouvel item
      basketData.push(newItem);
      
      // Sauvegarder le panier mis à jour
      await savePanier(basketData);
      
      // Mettre à jour le compteur du panier
      setBagCount(basketData.length);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du panier:', error);
    }
  };
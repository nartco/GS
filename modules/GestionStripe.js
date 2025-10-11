import axiosInstance from '../axiosInstance';

export const fetchPaymentIntentClientSecret = async (
  amount,
  uid,
  nom,
  savedCard,
  phone,
) => {

  const response = await axiosInstance.post(
    '/stripe/payment',
    {
      amount: amount * 100,
      uuid: uid,
      nom: nom,
      savedCard: savedCard,
      phone: phone,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data.paymentIntent;
};

export const doPaymentWithSavedCard = async (uid, cardId, amount) => {
  const response = await axiosInstance.post(
    '/stripe/payment/use_saved_card',
    {
      uuid: uid,
      cardId: cardId,
      amount: amount * 100,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response?.data;
};

export const getClientCards = async uid => {
  console.log('response.data', uid);
  let response;
  try {
    response = await axiosInstance.post(
      '/stripe/all/cards',
      {
        uuid: uid,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
  console.log('2332233232');
  return response?.data;
};

export const saveCard = async (uid, nom, paymentMethodId, phone) => {
  const response = await axiosInstance.post(
    '/stripe/save/cards',
    {
      paymentMethodId: paymentMethodId,
      uuid: uid,
      nom: nom,
      phone: phone,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

export const removeCard = async (uuid, cardId) => {
  const response = await axiosInstance.post(
    '/stripe/remove/cards',
    {
      cardId: cardId,
      uuid: uuid,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

/**
 * Retry d'un paiement quand le PI est en `requires_action` (3DS requis).
 * À appeler quand ton back renvoie `requires_action` + { paymentIntentId, clientSecret }.
 *
 * @param {object} args
 * @param {string} args.paymentIntentId - ID du PaymentIntent (pi_...)
 * @param {string} args.clientSecret - client_secret du PaymentIntent
 * @param {function} args.handleNextAction - provient de useStripe()
 * @returns {Promise<{ok:boolean, status:string, message?:string}>}
 */
export async function retryPaymentWith3DS({
  paymentIntentId,
  clientSecret,
  handleNextAction,
}) {
  // 1) lancer le challenge 3DS dans l’app
  const result = await handleNextAction(clientSecret);

  if (result?.error) {
    return {
      ok: false,
      status: 'requires_payment_method',
      message: result.error.message,
    };
  }

  // 2) Re-check côté serveur (source de vérité)
  try {
    const { data: final } = await axiosInstance.get('/stripe/payment/intent_status', {
      params: { payment_intent_id: paymentIntentId },
    });

    const status = final?.status || 'unknown';
    const success = status === 'succeeded' || status === 'processing';

    return { ok: !!success, status };
  } catch (err) {
    return {
      ok: false,
      status: 'error',
      message: err?.message || 'Erreur lors de la vérification du paiement',
    };
  }
}
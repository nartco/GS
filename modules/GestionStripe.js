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

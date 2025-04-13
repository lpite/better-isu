export default async function loginPageParser(response: Response) {
  const text = await response.text();
  if (text.includes("Викладач")) {
    return {
      error: "Ви не є студентом (наразі реалізовано тільки для студентів)",
      success: false,
    };
  }

  if (text.includes("Аутентифікація не пройшла")) {
    return {
      error: "Неправильний пароль або логін",
      success: false,
    };
  }

  if (!text.includes("Вхід користувача")) {
    return {
      error: "Неправильний пароль або логін",
      success: false,
    };
  }

  return { error: null, success: true };
}

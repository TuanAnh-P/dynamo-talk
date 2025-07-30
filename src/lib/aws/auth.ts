import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { awsConfig } from "./config";

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: awsConfig.region,
});

export interface SignUpParams {
  email: string;
  password: string;
  username: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ConfirmSignUpParams {
  email: string;
  confirmationCode: string;
}

export interface AuthResult {
  success: boolean;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  error?: string;
}

// Sign up new user
export const signUp = async ({
  email,
  password,
  username,
}: SignUpParams): Promise<AuthResult> => {
  try {
    const command = new SignUpCommand({
      ClientId: awsConfig.userPoolClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "preferred_username",
          Value: username,
        },
      ],
    });

    const response = await cognitoClient.send(command);

    return {
      success: true,
      error: response.UserSub ? undefined : "Sign up failed",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
};

// Confirm sign up with verification code
export const confirmSignUp = async ({
  email,
  confirmationCode,
}: ConfirmSignUpParams): Promise<AuthResult> => {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: awsConfig.userPoolClientId,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Confirmation failed",
    };
  }
};

// Sign in user
export const signIn = async ({
  email,
  password,
}: SignInParams): Promise<AuthResult> => {
  try {
    const command = new InitiateAuthCommand({
      ClientId: awsConfig.userPoolClientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      return {
        success: true,
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      };
    }

    return {
      success: false,
      error: "Authentication failed",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
};

// Resend confirmation code
export const resendConfirmationCode = async (
  email: string
): Promise<AuthResult> => {
  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: awsConfig.userPoolClientId,
      Username: email,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend code",
    };
  }
};

// Parse JWT token to get user info
export const parseJwtToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT token:", error);
    return null;
  }
};

import { NextResponse } from "next/server";

/**
 * Debug endpoint to test Supabase adapter configuration
 * DELETE THIS FILE AFTER DEBUGGING
 */
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    config: {
      supabaseUrlSet: Boolean(supabaseUrl),
      supabaseUrlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 40)}...` : "NOT SET",
      serviceKeySet: Boolean(supabaseServiceKey),
      serviceKeyLength: supabaseServiceKey?.length || 0,
    },
  };

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      ...results,
      error: "Missing environment variables",
    }, { status: 500 });
  }

  // Test 1: Check if we can reach the Supabase REST API
  try {
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    });
    results.restApiReachable = healthResponse.ok;
    results.restApiStatus = healthResponse.status;
  } catch (error) {
    results.restApiReachable = false;
    results.restApiError = error instanceof Error ? error.message : String(error);
  }

  // Test 2: Query the next_auth.users table directly
  try {
    const usersResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?select=id&limit=1`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Accept-Profile": "next_auth",
          "Content-Profile": "next_auth",
        },
      }
    );

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      results.nextAuthUsersTable = {
        status: usersResponse.status,
        ok: false,
        error: errorText,
      };
    } else {
      const data = await usersResponse.json();
      results.nextAuthUsersTable = {
        status: usersResponse.status,
        ok: true,
        rowCount: Array.isArray(data) ? data.length : "unknown",
      };
    }
  } catch (error) {
    results.nextAuthUsersTable = {
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 3: Check the schema exists by querying information_schema
  try {
    const schemaResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/check_next_auth_schema`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );
    
    if (schemaResponse.status === 404) {
      results.schemaCheck = "RPC function not found (expected)";
    } else {
      results.schemaCheck = {
        status: schemaResponse.status,
        body: await schemaResponse.text(),
      };
    }
  } catch (error) {
    results.schemaCheck = {
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 4: Try to query the accounts table too
  try {
    const accountsResponse = await fetch(
      `${supabaseUrl}/rest/v1/accounts?select=id&limit=1`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Accept-Profile": "next_auth",
          "Content-Profile": "next_auth",
        },
      }
    );

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      results.nextAuthAccountsTable = {
        status: accountsResponse.status,
        ok: false,
        error: errorText,
      };
    } else {
      results.nextAuthAccountsTable = {
        status: accountsResponse.status,
        ok: true,
      };
    }
  } catch (error) {
    results.nextAuthAccountsTable = {
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const hasErrors = !results.restApiReachable || 
    (typeof results.nextAuthUsersTable === 'object' && 'error' in (results.nextAuthUsersTable as Record<string, unknown>));

  return NextResponse.json(results, { 
    status: hasErrors ? 500 : 200 
  });
}


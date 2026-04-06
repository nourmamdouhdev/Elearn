import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { WalletTopup } from "@/components/student/WalletTopup";
import { WalletVerify } from "@/components/student/WalletVerify";

interface PageProps {
  searchParams: Promise<{ success?: string; canceled?: string; amount?: string; session_id?: string }>;
}

export default async function WalletPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const params = await searchParams;

  if (!userId) return null;

  // Fetch wallet and recent transactions
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      }
    }
  });

  const balance = wallet?.balance?.toString() || "0.00";
  const transactions = wallet?.transactions || [];

  return (
    <div className="flex-col gap-2xl" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div>
        <h1 className="mb-sm">المحفظة الإلكترونية</h1>
        <p style={{ color: "var(--text-secondary)" }}>أدر رصيدك واشحن محفظتك بكل سهولة وبأمان.</p>
      </div>

      {/* Payment Verification — actively credits the wallet */}
      {params.success && params.session_id && (
        <WalletVerify sessionId={params.session_id} amount={params.amount || "0"} />
      )}

      {params.canceled && (
        <div
          className="flex items-center gap-md p-lg rounded-xl animate-fade-in"
          style={{ background: "rgba(255, 185, 70, 0.1)", border: "1px solid var(--warning)" }}
        >
          <p style={{ fontWeight: 600, color: "var(--warning)" }}>
            تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ.
          </p>
        </div>
      )}

      <div className="grid grid-2 gap-lg">
        {/* Balance Card */}
        <div className="card card-gradient flex-col items-center justify-center text-center py-2xl" style={{ position: "relative", overflow: "hidden" }}>
          <Wallet size={48} style={{ opacity: 0.2, position: "absolute", top: -10, right: -10, transform: "scale(3)" }} />
          <p style={{ fontSize: "1.1rem", marginBottom: "var(--space-sm)", opacity: 0.9 }}>الرصيد المتاح</p>
          <div style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1 }}>
            {balance} <span style={{ fontSize: "1.2rem", fontWeight: 500, opacity: 0.9 }}>ج.م</span>
          </div>
        </div>

        {/* Top up Actions */}
        <WalletTopup />
      </div>

      {/* Transaction History */}
      <div className="card mt-lg">
        <h3 className="mb-lg px-xl pt-xl">سجل المعاملات</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-2xl" style={{ color: "var(--text-tertiary)" }}>
            لا توجد حركات مالية سابقة
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <th style={{ padding: "var(--space-md) var(--space-xl)", fontWeight: 600 }}>النوع</th>
                  <th style={{ padding: "var(--space-md) var(--space-xl)", fontWeight: 600 }}>المبلغ</th>
                  <th style={{ padding: "var(--space-md) var(--space-xl)", fontWeight: 600 }}>التفاصيل</th>
                  <th style={{ padding: "var(--space-md) var(--space-xl)", fontWeight: 600 }}>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isPositive = tx.type === "DEPOSIT" || tx.type === "EARNING" || tx.type === "REFUND";
                  return (
                    <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "var(--space-md) var(--space-xl)" }}>
                        <div className={`badge ${isPositive ? 'badge-success' : 'badge-error'}`}>
                          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {tx.type}
                        </div>
                      </td>
                      <td style={{ padding: "var(--space-md) var(--space-xl)", fontWeight: 700, color: isPositive ? "var(--success)" : "var(--text-primary)" }}>
                        {isPositive ? "+" : "-"}{tx.amount.toString()} ج.م
                      </td>
                      <td style={{ padding: "var(--space-md) var(--space-xl)", color: "var(--text-secondary)" }}>
                        {tx.description || "معاملة مالية"}
                      </td>
                      <td style={{ padding: "var(--space-md) var(--space-xl)", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                        {tx.createdAt.toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

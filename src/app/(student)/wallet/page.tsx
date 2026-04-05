import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Wallet, Plus, CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default async function WalletPage() {
  const session = await auth();
  const userId = session?.user?.id;

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
        <div className="card flex-col gap-md justify-center py-xl px-xl">
          <h3 className="mb-sm">إضافة رصيد</h3>
          
          <button className="btn btn-primary w-full justify-between" style={{ padding: "1rem" }}>
            <span className="flex items-center gap-sm"><CreditCard size={20} /> دفع إلكتروني (بطاقة بنكية)</span>
            <Plus size={20} />
          </button>
          
          <div className="divider my-sm">
            <span className="divider-text">أو باستخدام</span>
          </div>

          <form className="flex gap-sm">
            <input 
              type="text" 
              className="form-input" 
              placeholder="أدخل كود الشحن (مثال: EL-1234)" 
              style={{ flex: 1 }}
              dir="ltr"
            />
            <button type="button" className="btn btn-secondary">شحن</button>
          </form>
        </div>
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

interface SummaryProps {
    summary: ReturnType<typeof calculateSummary>;
    shippingDisplay: string;
}

const SummaryTotals: React.FC<SummaryProps> = ({ summary, shippingDisplay }) => {
    const { subtotal, taxes, total } = summary;

    const SummaryRow: React.FC<{ label: string; value: string | number; valueClass?: string }> = ({ label, value, valueClass = '' }) => (
        <div className="flex justify-between mb-2">
            <span className="text-gray-600">{label}</span>
            <span className={`font-medium ${valueClass}`}>
                {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
            </span>
        </div>
    );

    return (
        <div className="space-y-3 pt-4">
            <SummaryRow label="SubTotal" value={subtotal} />
            
            {/* Shipping */}
            <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={`font-medium ${shippingDisplay === 'FREE' ? 'text-green-600' : ''}`}>
                    {shippingDisplay}
                </span>
            </div>

            <SummaryRow label={`Taxes (${TAXES}%)`} value={taxes} />

            <hr className="my-3 border-gray-300" />
            
            {/* Total */}
            <div className="flex justify-between pt-2">
                <span className="text-xl font-bold">TOTAL</span>
                <span className="text-2xl font-bold text-amber-800">${total.toFixed(2)}</span>
            </div>
        </div>
    );
};
type SubjectProps = {
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
    children?: React.ReactNode;
};

export default function Subject({ left, center, right, children }: SubjectProps) {
    return (
        <div className="relative">
            <div className="w-full h-16 bg-gradient-to-r from-sky-800 to-sky-900 sticky top-0 grid grid-cols-3 px-5 z-10">
                <div className="flex items-center">{left}</div>
                <div className="flex items-center justify-center">{center}</div>
                <div className="flex items-center justify-end">{right}</div>
            </div>
            <div className="flex items-center justify-center h-[90vh]">
                {children}
            </div>
        </div>
    );
}

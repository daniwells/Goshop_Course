import { MessageCircleMore, MessageCircleQuestion } from "lucide-react";

interface Question {
    question: string;
    answer: string;
}

interface Props {
    questions: Question[];
}

const ProductQuestions: React.FC<Props> = ({ questions }) => {
    return <div className="pt-6">
        <div className="h-12" >
            <h2 className="text-main-primary text-2xl font-bold">
                Questions & Answers ({questions.length})
            </h2>
        </div>
        <div className="mt-4">
            <ul className="space-y-5">
                { 
                    questions.map((questions, i) => (
                        <li key={i} className="relative mb-1">
                            <div className="space-y-2">
                                <div className="flex items-center gap-x-2">
                                    <MessageCircleQuestion className="w-4"/>
                                    <p className="text-sm font-bold leading-5">
                                        { questions.question }
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <MessageCircleMore className="w-4"/>
                                    <p className="text-sm leading-5">
                                        { questions.answer }
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))
                }
            </ul>
        </div>
    </div>;
}
 
export default ProductQuestions;
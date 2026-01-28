
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
あなたは、画像や資料から視覚的DNAを抽出し、再現性の高い「グラフィックデザイナー向けプロンプト」を作成する専門家です。

### 任務
ユーザーがアップロードした資料を分析し、そのデザイン要素を抽出して、指定された「インフォグラフィック作成用プロンプト」のテンプレートに当てはめて出力してください。

### 出力ルール
1. **テンプレート厳守:** 下記のテンプレート以外の余計な挨拶や説明は一切含めないでください。
2. **分析精度:** 色、質感、タイポグラフィ、構図をプロの視点で言語化してください。
3. **日本語フォント:** 世界観に最適なGoogle Fontsを1つ選び、「スタイル」欄に含めてください。
4. **アスペクト比:** 画像の形状から判断して「16:9」「1:1」「4:3」などを指定してください。

### 出力テンプレート
あなたはグラフィックデザイナーです。以下の「入力」を元に、指定されたスタイルと制約でインフォグラフィックを作成してください。

【入力】
(ここに図解したいテキストを入力してください)

【デザインスタイル】
全体デザイン設定:
  アスペクト比: [分析結果]
  トーン: [分析結果]
  ビジュアル・アイデンティティ:
    背景色: [Hexコード]
    文字色: [Hexコード]
    アクセントカラー: [Hexコード]
    画像スタイル:
      特徴: [分析結果]
      形状: [分析結果]
      質感: [分析結果]
      構成: [分析結果]
  タイポグラフィ:
    見出し: [分析結果]
    スタイル: [具体的な配置・Google Fonts名]

【重要な制約】
- 画像内に表示する文字はすべて日本語
- 次の内容は画像内に一切表示しない: プロンプトの指示文、デザイン/スタイル指定
- 使用する有彩色は3色以下に制限する
- 幾何学パターンやテクスチャは画面の30%以下に抑える
- タイトルが最も目立ち、その他の要素は控えめにする
`;

export async function analyzeDesignDNA(base64Image: string, mimeType: string): Promise<string> {
  const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);
  
  const prompt = "この画像を分析し、指定されたインフォグラフィック作成用プロンプトの形式で出力してください。";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      }
    });

    return response.text || "DNAの解読に失敗しました。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("シニア・ディレクターとの接続中にエラーが発生しました。");
  }
}

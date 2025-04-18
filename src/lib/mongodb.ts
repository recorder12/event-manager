import mongoose from "mongoose";

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI!;
  const MONGODB_DBNAME = process.env.MONGODB_DBNAME!;

  if (!MONGODB_URI || !MONGODB_DBNAME) {
    throw new Error(
      "Please define the MONGODB_URI and MONGODB_DBNAME environment variables inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // 최대 연결 수 (기본값: 5 → 10으로 증가)
      minPoolSize: 1, // 최소 연결 유지
      serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
    };

    cached.promise = mongoose
      .connect(MONGODB_URI + MONGODB_DBNAME, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;

    // ✅ 모델 강제 로드 (이미 등록된 경우 중복 실행 방지)
    // if (!mongoose.models.Building) {
    //   await Building.init(); // 기존 `findOne()` → `init()`으로 변경 (성능 최적화)
    // }
    // if (!mongoose.models.Unit) {
    //   await Unit.init();
    // }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

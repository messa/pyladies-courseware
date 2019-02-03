import asyncio
import bcrypt


class PasswordHashing:

    async def get_hash(self, password):
        assert isinstance(password, str)
        loop = asyncio.get_event_loop()
        def get_hash():
            return bcrypt.hashpw(
                password.encode(), bcrypt.gensalt()
            ).decode('ascii')
        pw_hash = await loop.run_in_executor(None, get_hash)
        assert await self.verify_hash(pw_hash, password)
        return pw_hash

    async def verify_hash(self, pw_hash, password):
        assert isinstance(pw_hash, str)
        assert isinstance(password, str)
        loop = asyncio.get_event_loop()
        check = lambda: bcrypt.checkpw(password.encode(), pw_hash.encode())
        matches = await loop.run_in_executor(None, check)
        return matches

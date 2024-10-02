import json
import sqlite3
from typing import Any, Dict, Optional, Sequence, Union


class Database:
    def __init__(
            self,
            connection_path: Optional[str] = "./DataBase.db",
            tables: Sequence[str] = ["main"]

    ) -> None:
        """Initialize the Database object.

        Parameters:
        connection_path (Optional[str]): Path to the SQLite database file.
        Defaults to "./DataBase.db".
        tables (Sequence[str]): Table names to be created in the database if they do not exist.

        Returns:
        None
        """


        self._connection = sqlite3.Connection(
            connection_path
        )


        self._setup(tables)



    def get(
            self,
            key: str,
            table: Optional[str] = "main"
    ) -> Union[None, Any]:
        """Retrieve a value from the database using a hierarchical key.

        Parameters:
        key (str): The hierarchical key to search for.
        table (Optional[str]): The table to query. Defaults to "main".

        Returns:
        Union[None, Any]: The value associated with the key, or None if the key does not exist.
        """
        keys = key.split('.')
        root_key = keys[0]
        root_value = self._get(root_key, table)
        if root_value is None:
            return None
        try:
            return self._traverse_dict(root_value, keys[1:])[keys[-1]]
        except KeyError:
            return root_value

    def set(
            self,
            key: str,
            value: Any,
            table: Optional[str] = "main"
    ) -> None:
        """Set a value in the database using a hierarchical key.

        Parameters:
        key (str): The hierarchical key to insert or update.
        value (Any): The value to be stored.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None
        """
        keys = key.split('.')

        root_key = keys[0]

        root_value = self._get(root_key, table) or {}
        if not isinstance(root_value, dict):
            root_value = {}
        data = self._traverse_dict(root_value, keys[1:], create_missing=True)

        data[keys[-1]] = value

        self._set(key=root_key, value=root_value, table=table)

    def delete(
            self,
            key: str,
            table: Optional[str] = "main"
    ) -> bool:
        """Delete a value from the database using a hierarchical key.

        Parameters:
        key (str): The hierarchical key to delete.
        table (Optional[str]): The table to delete from. Defaults to "main".

        Returns:
        bool: True if the key was deleted successfully, False otherwise.
        """
        keys = key.split('.')
        root_key = keys[0]
        root_value = self._get(root_key, table)

        if root_value is None:
            return False


        data = self._traverse_dict(root_value, keys[1:])

        if keys[-1] in data:
            del data[keys[-1]]
            if data == {}:
                return self._delete(key=root_key, table=table)

            self._set(root_key, root_value, table)
            return True


        return self._delete(
            key=key,
            table=table
        )



    def sum(
            self,
            key: str,
            value: float,
            table: Optional[str] = "main"
    ) -> None:
        """Add a number to a stored value in the database.

        Parameters:
        key (str): The hierarchical key to update.
        value (float): The number to add.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None

        Raises:
        ValueError: If the value or the stored value is not a number.
        sqlite3.DatabaseError: If there is an error executing the query.
        """

        if not self._is_float(value):
            raise ValueError("The value should be an integer or float.")
        keys = key.split('.')
        root_key = keys[0]
        root_value = self._get(root_key, table) or {}
        if not isinstance(root_value, dict):
            root_value = {}
        data = self._traverse_dict(root_value, keys[1:], create_missing=True)
        if not self._is_float(data.get(keys[-1], 0)):
            raise ValueError("The value at the key should be an integer or float.")

        data[keys[-1]] = data.get(keys[-1], 0) + value
        self._set(root_key, root_value, table)

    def sub(
            self,
            key: str,
            value: float,
            table: Optional[str] = "main"
    ) -> None:
        """Subtract a number from a stored value in the database.

        Parameters:
        key (str): The hierarchical key to update.
        value (float): The number to subtract.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None

        Raises:
        ValueError: If the value or the stored value is not a number.
        sqlite3.DatabaseError: If there is an error executing the query.
        """
        if not self._is_float(value):
            raise ValueError("The value should be an integer or float.")


        keys = key.split('.')

        root_key = keys[0]
        root_value = self._get(root_key, table) or {}
        if not isinstance(root_value, dict):
            root_value = {}
        data = self._traverse_dict(root_value, keys[1:], create_missing=True)
        if not self._is_float(data.get(keys[-1], 0)):
            raise ValueError("The value at the key should be an integer or float.")
        data[keys[-1]] = data.get(keys[-1], 0) - value
        self._set(root_key, root_value, table)

    def push(
        self,
        key: str,
        value: Any,
        table: Optional[str] = "main"
    ) -> None:
        """Append a value to a list stored in the database.

        Parameters:
        key (str): The hierarchical key to append the value to.
        value (Any): The value to append.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None

        Raises:
        ValueError: If the existing value is not a list or is not empty.
        sqlite3.DatabaseError: If there is an error executing the query.
        """


        keys = key.split('.')

        root_key = keys[0]
        root_value = self._get(root_key, table) or {}
        if not isinstance(root_value, dict):
            root_value = {}
        data = self._traverse_dict(root_value, keys[1:], create_missing=True)


        if not isinstance(data.get(keys[-1], []), Sequence):
            raise ValueError("The value at the key should be a list.")
        if data.get(keys[-1], []) == []:
            data[keys[-1]] = [value]
        else:

           data[keys[-1]].append(value)
        self._set(root_key, root_value, table)

    def pull(
        self,
        key: str,
        value: Any,
        table: Optional[str] = "main"
    ) -> None:
        """Remove a value from a list stored in the database.

        Parameters:
        key (str): The key to remove the value from.
        value (Any): The value to remove.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None

        Raises:
        ValueError: If the existing value is not a list.
        sqlite3.DatabaseError: If there is an error executing the query.
        """


        keys = key.split('.')

        root_key = keys[0]
        root_value = self._get(root_key, table) or {}
        if not isinstance(root_value, dict):
            root_value = {}
        data = self._traverse_dict(root_value, keys[1:], create_missing=True)



        if not isinstance(data.get(keys[-1], []), Sequence):
            raise ValueError("The value at the key should be a list.")
        if value in data.get(keys[-1], []):

           data[keys[-1]].remove(value)

        self._set(root_key, root_value, table)


    def _setup(
            self,
            tables: Sequence[str] = ["main"]

    ) -> None:
        """Set up the tables in the database.

        Parameters:
        tables (Sequence[str]): List of table names to create. Defaults to ["main"].

        Returns:
        None
        """


        cur = self._connection.cursor()
        for table in tables:
            cur.execute(f'CREATE TABLE IF NOT EXISTS "{table}" (key UNIQUE, value)')

        self._connection.commit()




    def _get(
            self,
            key: str,
            table: Optional[str] = "main"

    ) -> Union[None, Any]:
        """Retrieve a value from the database based on the key.

        Parameters:
        key (str): The key to search for in the table.
        table (Optional[str]): The table to query. Defaults to "main".

        Returns:
        Union[None, Any]: The value associated with the key, or None if the key does not exist.

        Raises:
        sqlite3.DatabaseError: If there is an error executing the query.
        """


        cur = self._connection.cursor()

        selected_value = [*cur.execute(f'SELECT value FROM "{table}" WHERE key = ?', (key,))]

        if selected_value != []:
            if len(selected_value[0]) > 0:

                return json.loads(selected_value[0][0])

        return None



    def _set(
            self,
            key: str,
            value: Any,
            table: Optional[str] = "main"

    ) -> None:
        """Set a value in the database for a specific key.

        Parameters:
        key (str): The key to insert or update.
        value (Any): The value to be stored.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None

        Raises:
        ValueError: If the value cannot be serialized to JSON.
        sqlite3.DatabaseError: If there is an error executing the query.
        """

        value = json.dumps(value)
        cur = self._connection.cursor()


        if self._get(key, table):
            cur.execute(f'UPDATE "{table}" SET value = ? WHERE key = ?', (value, key))
        else:
            cur.execute(f'INSERT INTO "{table}" (key, value) VALUES (?, ?)', (key, value))


        self._connection.commit()



    def _delete(
            self,
            key: str,
            table: Optional[str] = "main"

    ) -> bool:
        """Delete a key-value pair from the database.

        Parameters:
        key (str): The key to delete.
        table (Optional[str]): The table to delete from. Defaults to "main".

        Returns:
        bool: True if the key was deleted successfully, False otherwise.

        Raises:
        sqlite3.DatabaseError: If there is an error executing the query.
        """


        old_value = self._get(
            key,
            table
        )

        cur = self._connection.cursor()
        cur.execute(f"DELETE FROM \"{table}\" WHERE key = ?", (key,))

        self._connection.commit()

        new_value = self._get(
            key,
            table
        )

        return old_value != new_value





    def _sum(
            self,
            key: str,
            value: float,
            table: Optional[str] = "main"

    ) -> None:
        """Add a number to a stored value in the database.

        Parameters:
        key (str): The key to update.
        value (float): The number to add.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None

        Raises:
        ValueError: If the value or the stored value is not a number.
        sqlite3.DatabaseError: If there is an error executing the query.
        """

        old_value = self._get(
            key,
            table
        )

        if not self._is_float(value):
            raise ValueError("The value should be an integer or float")

        if old_value is not None:

            if not self._is_float(old_value):
                raise ValueError("The old value should be an integer or float")

            new_value = old_value + value
            return self._set(
                key,
                new_value,
                table
            )


        return self._set(
            key,
            value,
            table
        )

    def _sub(
            self,
            key: str,
            value: float,
            table: Optional[str] = "main"

    ) -> None:
        """Subtract a number from a stored value in the database.

        Parameters:
        key (str): The key to update.
        value (float): The number to subtract.
        table (Optional[str]): The table to update. Defaults to "main".

        Returns:
        None

        Raises:
        ValueError: If the value or the stored value is not a number.
        sqlite3.DatabaseError: If there is an error executing the query.
        """

        old_value = self._get(
            key,
            table
        )

        if not self._is_float(value):
            raise ValueError("The value should be an integer or float")

        if old_value is not None:

            if not self._is_float(old_value):
                raise ValueError("The old value should be an integer or float")

            new_value = old_value - value
            return self._set(
                key,
                new_value,
                table
            )


        return self._set(
            key,
            value,
            table
        )



    def values(
            self,
            table_name: str

    ) -> Sequence[Dict[str, Any]]:
        """Retrieve all key-value pairs from a table.

        Parameters:
        table_name (str): The name of the table to query.

        Returns:
        Sequence[Dict[str, Any]]: A list of dictionaries containing key-value pairs.

        Raises:
        sqlite3.DatabaseError: If there is an error executing the query.
        """


        cur = self._connection.cursor()

        cur.execute(f'SELECT * FROM {table_name}')
        values = [{row[0]: row[1]} for row in cur.fetchall()]

        return values


    def __enter__(
            self
    ) -> "Database":
        """Enter the runtime context related to this object.

        Returns:
        Database: The current instance of the class.
        """


        return self

    def __exit__(
            self,
            exc_type: Any,
            exc_val: Any,
            exc_tb: Any
    ) -> None:
        """Exit the runtime context related to this object.

        Parameters:
        exc_type (Any): The type of exception raised.
        exc_val (Any): The value of the exception raised.
        exc_tb (Any): The traceback object.

        Returns:
        None
        """

        self._connection.commit()
        self._connection.close()


    def _is_float(
            self,
            value: Any
    ) -> bool:
        """Check if a value can be converted to a float.

        Parameters:
        value (Any): The value to check.

        Returns:
        bool: True if the value can be converted to a float, False otherwise.
        """


        try:
            float(value)
            return True

        except ValueError:
            return False

    def _traverse_dict(
            self,
            data: Dict,
            keys: Sequence[str],
            create_missing: bool = False
    ):
        """Traverse a dictionary to get or set a nested value based on keys.

        Parameters:
        data (Dict): The dictionary to traverse.
        keys (Sequence[str]): The sequence of keys to follow.
        create_missing (bool): Whether to create missing keys. Defaults to False.

        Returns:
        Union[Dict, Any]: The final dictionary or value at the end of the key sequence.
        """
        for key in keys[:-1]:
            if create_missing and key not in data:
                data[key] = {}
            data = data[key]
        return data
    
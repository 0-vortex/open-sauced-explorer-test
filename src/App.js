import React, { Component } from 'react';
import GraphiQL from 'graphiql';
import GraphiQLExplorer from 'graphiql-explorer';
import { buildClientSchema, getIntrospectionQuery, parse } from 'graphql';

import { makeDefaultArg, getDefaultScalarArgValue } from './CustomArgs';

import 'graphiql/graphiql.css';
import './App.css';

import ColorSchemeToggle from './ColorSchemeToggle';

const fetcher = (params) => fetch(
  'https://serve.onegraph.com/dynamic?app_id=bc178799-292e-49df-8016-223abf5a07cb',
  {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  },
)
  .then((response) => response.text())
  .then((responseBody) => {
    try {
      return JSON.parse(responseBody);
    } catch (e) {
      return responseBody;
    }
  });

const DEFAULT_QUERY = `# shift-option/alt-click on a query below to jump to it in the explorer
# option/alt-click on a field in the explorer to select all subfields
query npmPackage {
  npm {
    package(name: "onegraph-apollo-client") {
      name
      homepage
      downloads {
        lastMonth {
          count
        }
      }
    }
  }
}
`;

class App extends Component {
  constructor(props) {
    super(props);
    this.graphiql = null;
    this.state = { schema: null, query: DEFAULT_QUERY, explorerIsOpen: true };
  }

  componentDidMount() {
    fetcher({
      query: getIntrospectionQuery(),
    }).then((result) => {
      const editor = this.graphiql.getQueryEditor();
      editor.setOption('extraKeys', {
        ...(editor.options.extraKeys || {}),
        'Shift-Alt-LeftClick': this.handleInspectOperation,
      });

      this.setState({ schema: buildClientSchema(result.data) });
    });
  }

  handleInspectOperation(
    cm,
    mousePos,
  ) {
    const { query } = this.state;
    const parsedQuery = parse(query || '');

    if (!parsedQuery) {
      console.error("Couldn't parse query document");
      return null;
    }

    const token = cm.getTokenAt(mousePos);
    const start = { line: mousePos.line, ch: token.start };
    const end = { line: mousePos.line, ch: token.end };
    const relevantMousePos = {
      start: cm.indexFromPos(start),
      end: cm.indexFromPos(end),
    };

    const position = relevantMousePos;

    const def = parsedQuery.definitions.find((definition) => {
      if (!definition.loc) {
        console.log('Missing location information for definition');
        return false;
      }

      const { loc } = definition;
      return loc.start <= position.start && loc.end >= position.end;
    });

    if (!def) {
      console.error(
        'Unable to find definition corresponding to mouse position',
      );
      return null;
    }

    let operationKind;
    if (def.kind === 'OperationDefinition') {
      operationKind = def.operation;
    } else {
      operationKind = def.kind === 'FragmentDefinition'
        ? 'fragment'
        : 'unknown';
    }

    let operationName;
    if (def.kind === 'OperationDefinition' && !!def.name) {
      operationName = def.name.value;
    } else {
      operationName = def.kind === 'FragmentDefinition' && !!def.name
        ? def.name.value
        : 'unknown';
    }

    const selector = `.graphiql-explorer-root #${operationKind}-${operationName}`;

    const el = document.querySelector(selector);
    if (el !== null) {
      el.scrollIntoView();
    }

    return false;
  }

  render() {
    const { query, schema, explorerIsOpen } = this.state;

    return (
      <div className="graphiql-container">
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={this.handleEditQuery}
          onRunOperation={(operationName) => this.graphiql.handleRunQuery(operationName)}
          explorerIsOpen={explorerIsOpen}
          onToggleExplorer={this.handleToggleExplorer}
          getDefaultScalarArgValue={getDefaultScalarArgValue}
          makeDefaultArg={makeDefaultArg}
        />
        <GraphiQL
          ref={(ref) => { this.graphiql = ref; }}
          fetcher={fetcher}
          schema={schema}
          query={query}
          onEditQuery={this.handleEditQuery}
          editorTheme="dracula"
        >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => this.graphiql.handlePrettifyQuery()}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />
            <GraphiQL.Button
              onClick={() => this.graphiql.handleToggleHistory()}
              label="History"
              title="Show History"
            />
            <GraphiQL.Button
              onClick={this.handleToggleExplorer}
              label="Explorer"
              title="Toggle Explorer"
            />
            <ColorSchemeToggle />
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}

export default App;
